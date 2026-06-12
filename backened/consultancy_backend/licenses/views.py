"""
License purchase & activation API.

Endpoints
---------
POST /api/licenses/initiate/              — create pending license, get payment URL
POST /api/licenses/webhook/               — payment system calls this on success
GET  /api/licenses/status/<ref>/          — poll for license status by payment reference
GET  /api/licenses/plans/                 — return available plans + pricing
POST /api/licenses/activate/              — online activation: validate key → issue session token
POST /api/licenses/heartbeat/             — monthly check-in: token → OK / REVOKED / EXPIRED
POST /api/licenses/tamper/                — desktop reports tamper event
POST /api/licenses/admin/generate/        — staff: machine_id + info → generate key immediately
GET  /api/licenses/admin/list/            — staff: list all licenses
POST /api/licenses/admin/revoke/<id>/     — staff: revoke a license
"""
import hashlib
import hmac
import json
import logging
import os
import uuid
from datetime import datetime, date

import requests
from django.conf import settings
from django.http import JsonResponse
from django.utils import timezone
from django.views import View
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator

from .email_utils import send_license_email
from .license_utils import generate_license_key
from .models import SoftwareLicense

logger = logging.getLogger(__name__)

PLANS = [
    {"id": "payroll_1yr",  "name": "Neton Payroll — 1 Year",  "months": 12, "price_zmw": "5000.00"},
    {"id": "payroll_2yr",  "name": "Neton Payroll — 2 Years", "months": 24, "price_zmw": "9000.00"},
]
PLAN_MAP = {p["id"]: p for p in PLANS}

PAYMENT_SYSTEM_URL   = os.environ.get("PAYMENT_SYSTEM_URL", "")
PAYMENT_SYSTEM_TOKEN = os.environ.get("PAYMENT_SYSTEM_TOKEN", "")
WEBHOOK_SECRET       = os.environ.get("LICENSE_WEBHOOK_SECRET", "neton-webhook-secret-change-me")

# Grace period the desktop app allows without a heartbeat (days)
HEARTBEAT_GRACE_DAYS = 7


_ALLOWED_ORIGINS = {"https://netongoc.com", "https://www.netongoc.com"}


def _cors(response, request=None):
    origin = (request.headers.get("Origin") or "") if request else ""
    allowed = origin if origin in _ALLOWED_ORIGINS else "https://netongoc.com"
    response["Access-Control-Allow-Origin"] = allowed
    response["Access-Control-Allow-Credentials"] = "true"
    response["Access-Control-Allow-Headers"] = "Content-Type, X-Webhook-Signature, X-CSRFToken, X-Admin-Token"
    response["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
    return response


def _is_admin(request) -> bool:
    secret = os.environ.get("ADMIN_SECRET", "")
    token  = request.headers.get("X-Admin-Token", "")
    if secret and token and token == secret:
        return True
    return request.user.is_authenticated and request.user.is_staff


def _client_ip(request):
    xff = request.META.get("HTTP_X_FORWARDED_FOR")
    return xff.split(",")[0].strip() if xff else request.META.get("REMOTE_ADDR", "")


# ── Public: plans ─────────────────────────────────────────────────────────────

@method_decorator(csrf_exempt, name='dispatch')
class PlansView(View):
    def get(self, request):
        return _cors(JsonResponse({"plans": PLANS}))
    def options(self, request):
        r = JsonResponse({})
        r["Access-Control-Allow-Methods"] = "GET, OPTIONS"
        return _cors(r)


# ── Online activation ─────────────────────────────────────────────────────────

@method_decorator(csrf_exempt, name='dispatch')
class OnlineActivateView(View):
    """
    Called by the desktop app after the user enters their key.
    Validates key against machine_id, issues a session_token, records activation.
    Body: { "license_key": "XXXX-...", "machine_id": "...", "app_version": "1.0" }
    Returns: { "ok": true, "token": "uuid", "expires_at": "YYYY-MM-DD", "company": "..." }
    """
    def options(self, request):
        r = JsonResponse({})
        r["Access-Control-Allow-Methods"] = "POST, OPTIONS"
        return _cors(r)

    def post(self, request):
        try:
            data = json.loads(request.body)
        except Exception:
            return _cors(JsonResponse({"ok": False, "error": "Invalid JSON."}, status=400))

        key        = (data.get("license_key") or "").strip().upper()
        machine_id = (data.get("machine_id") or "").strip().upper()
        app_ver    = (data.get("app_version") or "")[:30]

        if not key or not machine_id:
            return _cors(JsonResponse({"ok": False, "error": "license_key and machine_id required."}, status=400))

        try:
            lic = SoftwareLicense.objects.get(
                license_key=key,
                machine_id__iexact=machine_id,
                status=SoftwareLicense.STATUS_ACTIVE,
            )
        except SoftwareLicense.DoesNotExist:
            return _cors(JsonResponse({"ok": False, "error": "Invalid key, machine mismatch, or license not active."}, status=403))

        if lic.is_revoked:
            return _cors(JsonResponse({"ok": False, "error": "This license has been revoked. Contact support."}, status=403))

        if lic.expires_at and lic.expires_at < date.today():
            lic.status = SoftwareLicense.STATUS_EXPIRED
            lic.save(update_fields=["status"])
            return _cors(JsonResponse({"ok": False, "error": "License expired. Please renew."}, status=403))

        # Issue / refresh session token
        now = timezone.now()
        if not lic.session_token:
            lic.session_token = uuid.uuid4()
        lic.last_seen      = now
        lic.last_heartbeat = now
        lic.app_version    = app_ver
        lic.ip_address     = _client_ip(request)
        if not lic.activated_at:
            lic.activated_at = now
        lic.save(update_fields=[
            "session_token", "last_seen", "last_heartbeat",
            "app_version", "ip_address", "activated_at",
        ])

        return _cors(JsonResponse({
            "ok":         True,
            "token":      str(lic.session_token),
            "expires_at": lic.expires_at.strftime("%Y-%m-%d") if lic.expires_at else None,
            "company":    lic.company_name,
            "months":     lic.months,
        }))


# ── Monthly heartbeat ─────────────────────────────────────────────────────────

@method_decorator(csrf_exempt, name='dispatch')
class HeartbeatView(View):
    """
    Monthly phone-home from the desktop app.
    Body: { "token": "uuid", "machine_id": "...", "app_version": "1.0" }
    Returns: { "status": "ok"|"revoked"|"expired", "expires_at": "..." }
    """
    def options(self, request):
        r = JsonResponse({})
        r["Access-Control-Allow-Methods"] = "POST, OPTIONS"
        return _cors(r)

    def post(self, request):
        try:
            data = json.loads(request.body)
        except Exception:
            return _cors(JsonResponse({"status": "error", "error": "Invalid JSON."}, status=400))

        token_raw  = (data.get("token") or "").strip()
        machine_id = (data.get("machine_id") or "").strip().upper()
        app_ver    = (data.get("app_version") or "")[:30]

        if not token_raw or not machine_id:
            return _cors(JsonResponse({"status": "error", "error": "token and machine_id required."}, status=400))

        try:
            token = uuid.UUID(token_raw)
        except ValueError:
            return _cors(JsonResponse({"status": "revoked", "error": "Invalid token."}, status=403))

        try:
            lic = SoftwareLicense.objects.get(
                session_token=token,
                machine_id__iexact=machine_id,
            )
        except SoftwareLicense.DoesNotExist:
            return _cors(JsonResponse({"status": "revoked", "error": "Session not recognised."}, status=403))

        if lic.is_revoked or lic.status == SoftwareLicense.STATUS_REVOKED:
            return _cors(JsonResponse({"status": "revoked", "error": "License revoked."}))

        if lic.expires_at and lic.expires_at < date.today():
            lic.status = SoftwareLicense.STATUS_EXPIRED
            lic.save(update_fields=["status"])
            return _cors(JsonResponse({"status": "expired", "error": "License expired."}))

        now = timezone.now()
        lic.last_seen      = now
        lic.last_heartbeat = now
        lic.app_version    = app_ver
        lic.ip_address     = _client_ip(request)
        lic.save(update_fields=["last_seen", "last_heartbeat", "app_version", "ip_address"])

        return _cors(JsonResponse({
            "status":     "ok",
            "expires_at": lic.expires_at.strftime("%Y-%m-%d") if lic.expires_at else None,
            "company":    lic.company_name,
        }))


# ── Tamper report ─────────────────────────────────────────────────────────────

@method_decorator(csrf_exempt, name='dispatch')
class TamperReportView(View):
    """
    Desktop reports a tamper event.
    Body: { "token": "uuid", "machine_id": "...", "detail": "..." }
    """
    def options(self, request):
        r = JsonResponse({})
        r["Access-Control-Allow-Methods"] = "POST, OPTIONS"
        return _cors(r)

    def post(self, request):
        try:
            data = json.loads(request.body)
        except Exception:
            return _cors(JsonResponse({"ok": False}, status=400))

        token_raw  = (data.get("token") or "").strip()
        machine_id = (data.get("machine_id") or "").strip().upper()
        detail     = (data.get("detail") or "")[:500]

        try:
            token = uuid.UUID(token_raw)
            lic = SoftwareLicense.objects.get(
                session_token=token,
                machine_id__iexact=machine_id,
            )
            lic.tamper_count += 1
            lic.tamper_flag   = True
            lic.last_seen     = timezone.now()
            lic.ip_address    = _client_ip(request)
            existing = lic.notes or ""
            lic.notes = (
                f"[TAMPER {timezone.now().strftime('%Y-%m-%d %H:%M')} "
                f"ip={_client_ip(request)}] {detail}\n" + existing
            )[:4000]
            lic.save(update_fields=["tamper_count", "tamper_flag", "last_seen", "ip_address", "notes"])
            logger.warning("TAMPER detected: license=%s machine=%s detail=%s", lic.id, machine_id, detail)
        except Exception:
            pass  # Always return 200 — don't let cracker know we logged it

        return _cors(JsonResponse({"ok": True}))


# ── Admin: generate key manually ─────────────────────────────────────────────

@method_decorator(csrf_exempt, name='dispatch')
class AdminGenerateView(View):
    """
    Staff-only. Enter machine_id + user info → generate key immediately, no payment needed.
    Body: { "machine_id": "...", "company_name": "...", "contact_name": "...",
            "email": "...", "phone": "...", "months": 12, "notes": "..." }
    """
    def options(self, request):
        r = JsonResponse({})
        r["Access-Control-Allow-Methods"] = "POST, OPTIONS"
        return _cors(r)

    def post(self, request):
        if not _is_admin(request):
            return _cors(JsonResponse({"error": "Admin access required."}, status=403))

        try:
            data = json.loads(request.body)
        except Exception:
            return _cors(JsonResponse({"error": "Invalid JSON."}, status=400))

        machine_id   = (data.get("machine_id") or "").strip().upper()
        company_name = (data.get("company_name") or "").strip()
        contact_name = (data.get("contact_name") or "").strip()
        email        = (data.get("email") or "").strip()
        phone        = (data.get("phone") or "").strip()[:30]
        months       = int(data.get("months") or 12)
        notes        = (data.get("notes") or "").strip()[:1000]

        if not machine_id:
            return _cors(JsonResponse({"error": "machine_id required."}, status=400))
        if not company_name:
            return _cors(JsonResponse({"error": "company_name required."}, status=400))
        if months < 1 or months > 36:
            return _cors(JsonResponse({"error": "months must be 1–36."}, status=400))

        key, expiry = generate_license_key(machine_id, months)

        # Create or update a record for this machine
        lic, created = SoftwareLicense.objects.get_or_create(
            machine_id=machine_id,
            defaults={
                "company_name": company_name,
                "contact_name": contact_name,
                "email":        email or "admin@neton",
                "phone":        phone,
                "months":       months,
                "amount_zmw":   0,
            },
        )
        lic.license_key  = key
        lic.expires_at   = expiry
        lic.status       = SoftwareLicense.STATUS_ACTIVE
        lic.months       = months
        lic.company_name = company_name
        lic.contact_name = contact_name
        if email:
            lic.email = email
        if phone:
            lic.phone = phone
        if notes:
            lic.notes = notes
        lic.activated_at = timezone.now()
        lic.is_revoked   = False
        lic.save()

        return _cors(JsonResponse({
            "ok":          True,
            "license_key": key,
            "expires_at":  expiry.strftime("%B %Y"),
            "company":     lic.company_name,
            "machine_id":  machine_id,
            "created":     created,
        }))


# ── Admin: list all licenses ──────────────────────────────────────────────────

@method_decorator(csrf_exempt, name='dispatch')
class AdminListView(View):
    def options(self, request):
        r = JsonResponse({})
        r["Access-Control-Allow-Methods"] = "GET, OPTIONS"
        return _cors(r)

    def get(self, request):
        if not _is_admin(request):
            return _cors(JsonResponse({"error": "Admin access required."}, status=403))

        lics = SoftwareLicense.objects.all().order_by('-created_at')[:200]
        rows = []
        for lic in lics:
            rows.append({
                "id":             str(lic.id),
                "company_name":   lic.company_name,
                "contact_name":   lic.contact_name,
                "email":          lic.email,
                "phone":          lic.phone,
                "machine_id":     lic.machine_id,
                "license_key":    lic.license_key,
                "status":         lic.status,
                "is_revoked":     lic.is_revoked,
                "expires_at":     lic.expires_at.strftime("%Y-%m-%d") if lic.expires_at else None,
                "activated_at":   lic.activated_at.strftime("%Y-%m-%d %H:%M") if lic.activated_at else None,
                "last_heartbeat": lic.last_heartbeat.strftime("%Y-%m-%d %H:%M") if lic.last_heartbeat else None,
                "last_seen":      lic.last_seen.strftime("%Y-%m-%d %H:%M") if lic.last_seen else None,
                "tamper_flag":    lic.tamper_flag,
                "tamper_count":   lic.tamper_count,
                "app_version":    lic.app_version,
                "ip_address":     lic.ip_address,
                "notes":          lic.notes,
                "months":         lic.months,
                "created_at":     lic.created_at.strftime("%Y-%m-%d"),
            })
        return _cors(JsonResponse({"licenses": rows}))


# ── Admin: revoke ─────────────────────────────────────────────────────────────

@method_decorator(csrf_exempt, name='dispatch')
class AdminRevokeView(View):
    def options(self, request, license_id):
        r = JsonResponse({})
        r["Access-Control-Allow-Methods"] = "POST, OPTIONS"
        return _cors(r)

    def post(self, request, license_id):
        if not _is_admin(request):
            return _cors(JsonResponse({"error": "Admin access required."}, status=403))

        try:
            lic = SoftwareLicense.objects.get(id=license_id)
        except SoftwareLicense.DoesNotExist:
            return _cors(JsonResponse({"error": "Not found."}, status=404))

        try:
            data = json.loads(request.body) if request.body else {}
        except Exception:
            data = {}

        action = data.get("action", "revoke")
        if action == "unrevoke":
            lic.is_revoked = False
            lic.status     = SoftwareLicense.STATUS_ACTIVE
        else:
            lic.is_revoked    = True
            lic.status        = SoftwareLicense.STATUS_REVOKED
            lic.session_token = None  # invalidate live session immediately
        lic.save()
        return _cors(JsonResponse({"ok": True, "is_revoked": lic.is_revoked}))


# ── Purchase flow (unchanged) ─────────────────────────────────────────────────

@method_decorator(csrf_exempt, name='dispatch')
class InitiateLicenseView(View):
    def options(self, request):
        r = JsonResponse({})
        r["Access-Control-Allow-Methods"] = "POST, OPTIONS"
        return _cors(r)

    def post(self, request):
        try:
            data = json.loads(request.body)
        except Exception:
            return _cors(JsonResponse({"error": "Invalid JSON."}, status=400))

        required = ["machine_id", "company_name", "contact_name", "email", "plan_id"]
        missing = [f for f in required if not data.get(f)]
        if missing:
            return _cors(JsonResponse({"error": f"Missing fields: {', '.join(missing)}"}, status=400))

        plan = PLAN_MAP.get(data["plan_id"])
        if not plan:
            return _cors(JsonResponse({"error": "Invalid plan_id."}, status=400))

        license_obj = SoftwareLicense.objects.create(
            machine_id    = data["machine_id"].strip().upper()[:64],
            company_name  = data["company_name"][:200],
            contact_name  = data["contact_name"][:200],
            email         = data["email"][:254],
            phone         = data.get("phone", "")[:30],
            months        = plan["months"],
            amount_zmw    = plan["price_zmw"],
            status        = SoftwareLicense.STATUS_PENDING,
        )

        if PAYMENT_SYSTEM_URL and PAYMENT_SYSTEM_TOKEN:
            try:
                resp = requests.post(
                    f"{PAYMENT_SYSTEM_URL}/api/v1/payments/initiate/",
                    headers={
                        "Authorization": f"Bearer {PAYMENT_SYSTEM_TOKEN}",
                        "Content-Type": "application/json",
                    },
                    json={
                        "amount": str(plan["price_zmw"]),
                        "currency": "ZMW",
                        "description": f"Neton Payroll License — {data['company_name']}",
                        "merchant_reference": str(license_obj.id),
                        "customer_phone": data.get("phone", ""),
                        "customer_email": data["email"],
                        "callback_url": f"{settings.SITE_URL}/api/licenses/webhook/",
                        "metadata": {"license_id": str(license_obj.id)},
                    },
                    timeout=10,
                )
                resp.raise_for_status()
                payload      = resp.json()
                session_id   = payload.get("session_id", "")
                checkout_url = payload.get("checkout_url", "")
                license_obj.payment_session_id = session_id
                license_obj.payment_reference  = payload.get("reference", str(license_obj.id))
                license_obj.save(update_fields=["payment_session_id", "payment_reference"])
                return _cors(JsonResponse({
                    "license_id":   str(license_obj.id),
                    "reference":    license_obj.payment_reference,
                    "checkout_url": checkout_url,
                    "mode":         "live",
                }))
            except Exception as exc:
                logger.error("Payment system initiation failed: %s", exc)
                license_obj.delete()
                return _cors(JsonResponse({"error": "Payment system unavailable."}, status=502))

        ref = str(uuid.uuid4()).replace("-", "")[:16].upper()
        license_obj.payment_reference = ref
        license_obj.save(update_fields=["payment_reference"])
        sandbox_url = f"{_site_url(request)}/payroll/confirm?ref={ref}&sandbox=1"
        return _cors(JsonResponse({
            "license_id":   str(license_obj.id),
            "reference":    ref,
            "checkout_url": sandbox_url,
            "mode":         "sandbox",
        }))


def _site_url(request):
    return os.environ.get("SITE_URL", f"{request.scheme}://{request.get_host()}")


@method_decorator(csrf_exempt, name='dispatch')
class LicenseWebhookView(View):
    def options(self, request):
        r = JsonResponse({})
        r["Access-Control-Allow-Methods"] = "POST, OPTIONS"
        return _cors(r)

    def post(self, request):
        sig = request.headers.get("X-Webhook-Signature", "")
        if WEBHOOK_SECRET and sig:
            expected = hmac.new(
                WEBHOOK_SECRET.encode(), request.body, hashlib.sha256
            ).hexdigest()
            if not hmac.compare_digest(sig, expected):
                return _cors(JsonResponse({"error": "Invalid signature."}, status=401))

        try:
            data = json.loads(request.body)
        except Exception:
            return _cors(JsonResponse({"error": "Invalid JSON."}, status=400))

        ref        = data.get("reference") or data.get("merchant_reference") or data.get("ref")
        status_val = data.get("status", "completed")

        if not ref:
            return _cors(JsonResponse({"error": "Missing reference."}, status=400))

        try:
            lic = SoftwareLicense.objects.get(payment_reference=ref, status=SoftwareLicense.STATUS_PENDING)
        except SoftwareLicense.DoesNotExist:
            return _cors(JsonResponse({"error": "License not found or already activated."}, status=404))

        if status_val not in ("completed", "success", "approved", "sandbox_approved"):
            lic.status = SoftwareLicense.STATUS_CANCELLED
            lic.save(update_fields=["status"])
            return _cors(JsonResponse({"ok": False, "message": "Payment not successful."}))

        key, expiry = generate_license_key(lic.machine_id, lic.months)
        lic.license_key  = key
        lic.expires_at   = expiry
        lic.status       = SoftwareLicense.STATUS_ACTIVE
        lic.activated_at = timezone.now()
        lic.save(update_fields=["license_key", "expires_at", "status", "activated_at"])

        try:
            send_license_email(lic)
        except Exception as exc:
            logger.error("Failed to send license email to %s: %s", lic.email, exc)

        return _cors(JsonResponse({
            "ok":          True,
            "license_key": key,
            "expires_at":  expiry.strftime("%B %Y"),
            "company":     lic.company_name,
        }))


@method_decorator(csrf_exempt, name='dispatch')
class SandboxConfirmView(View):
    def options(self, request):
        r = JsonResponse({})
        r["Access-Control-Allow-Methods"] = "POST, OPTIONS"
        return _cors(r)

    def post(self, request):
        if not settings.DEBUG:
            return _cors(JsonResponse({"error": "Not available in production."}, status=403))
        try:
            data = json.loads(request.body)
        except Exception:
            return _cors(JsonResponse({"error": "Invalid JSON."}, status=400))
        ref = data.get("ref")
        if not ref:
            return _cors(JsonResponse({"error": "Missing ref."}, status=400))

        import io
        payload = json.dumps({"reference": ref, "status": "sandbox_approved", "sandbox": True}).encode()
        fake_request = request
        fake_request._body = payload
        return LicenseWebhookView().post(fake_request)


@method_decorator(csrf_exempt, name='dispatch')
class LicenseStatusView(View):
    def get(self, request, ref):
        try:
            lic = SoftwareLicense.objects.get(payment_reference=ref)
        except SoftwareLicense.DoesNotExist:
            return _cors(JsonResponse({"error": "Not found."}, status=404))

        resp = {
            "status":     lic.status,
            "company":    lic.company_name,
            "machine_id": lic.machine_id,
        }
        if lic.status == SoftwareLicense.STATUS_ACTIVE:
            resp["license_key"] = lic.license_key
            resp["expires_at"]  = lic.expires_at.strftime("%B %Y")

        return _cors(JsonResponse(resp))

    def options(self, request, ref):
        r = JsonResponse({})
        r["Access-Control-Allow-Methods"] = "GET, OPTIONS"
        return _cors(r)
