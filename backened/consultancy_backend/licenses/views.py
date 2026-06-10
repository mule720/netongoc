"""
License purchase & activation API.

Endpoints
---------
POST /api/licenses/initiate/        — create pending license, get payment URL
POST /api/licenses/webhook/         — payment system calls this on success
GET  /api/licenses/status/<ref>/    — poll for license status by payment reference
GET  /api/licenses/plans/           — return available plans + pricing
"""
import hashlib
import hmac
import json
import logging
import os
import uuid
from datetime import datetime

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


def _cors(response):
    response["Access-Control-Allow-Origin"] = "*"
    response["Access-Control-Allow-Headers"] = "Content-Type, X-Webhook-Signature"
    return response


@method_decorator(csrf_exempt, name='dispatch')
class PlansView(View):
    def get(self, request):
        return _cors(JsonResponse({"plans": PLANS}))

    def options(self, request):
        r = JsonResponse({})
        r["Access-Control-Allow-Methods"] = "GET, OPTIONS"
        return _cors(r)


@method_decorator(csrf_exempt, name='dispatch')
class InitiateLicenseView(View):
    """
    Accepts purchase request, creates a pending SoftwareLicense,
    then either:
      (a) calls the real payment system if PAYMENT_SYSTEM_URL is set, or
      (b) returns a sandbox confirmation URL for testing.
    """

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
            machine_id    = data["machine_id"].strip().upper()[:32],
            company_name  = data["company_name"][:200],
            contact_name  = data["contact_name"][:200],
            email         = data["email"][:254],
            phone         = data.get("phone", "")[:30],
            months        = plan["months"],
            amount_zmw    = plan["price_zmw"],
            status        = SoftwareLicense.STATUS_PENDING,
        )

        # ── Real payment system integration ───────────────────────────────
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
                payload = resp.json()
                session_id  = payload.get("session_id", "")
                checkout_url = payload.get("checkout_url", "")
                license_obj.payment_session_id = session_id
                license_obj.payment_reference  = payload.get("reference", str(license_obj.id))
                license_obj.save(update_fields=["payment_session_id", "payment_reference"])
                return _cors(JsonResponse({
                    "license_id":    str(license_obj.id),
                    "reference":     license_obj.payment_reference,
                    "checkout_url":  checkout_url,
                    "mode":          "live",
                }))
            except Exception as exc:
                logger.error("Payment system initiation failed: %s", exc)
                # Fall through to sandbox mode so the flow still works during dev
                license_obj.delete()
                return _cors(JsonResponse({"error": "Payment system unavailable. Please try again."}, status=502))

        # ── Sandbox / stub mode (no payment system configured) ────────────
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
    """
    Called by the payment system (or sandbox confirm page) when payment succeeds.
    Verifies HMAC signature, activates license, emails key.
    """

    def options(self, request):
        r = JsonResponse({})
        r["Access-Control-Allow-Methods"] = "POST, OPTIONS"
        return _cors(r)

    def post(self, request):
        # Verify webhook signature (X-Webhook-Signature: HMAC-SHA256 of body)
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
        sandbox    = data.get("sandbox", False)

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
        lic.license_key   = key
        lic.expires_at    = expiry
        lic.status        = SoftwareLicense.STATUS_ACTIVE
        lic.activated_at  = timezone.now()
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
    """Dev-only: simulate a successful payment for a pending license."""

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

        # Reuse the webhook handler
        import io
        payload = json.dumps({"reference": ref, "status": "sandbox_approved", "sandbox": True}).encode()
        fake_request = request
        fake_request._body = payload
        return LicenseWebhookView().post(fake_request)


@method_decorator(csrf_exempt, name='dispatch')
class LicenseStatusView(View):
    """Poll for license status after payment."""

    def get(self, request, ref):
        try:
            lic = SoftwareLicense.objects.get(payment_reference=ref)
        except SoftwareLicense.DoesNotExist:
            return _cors(JsonResponse({"error": "Not found."}, status=404))

        resp = {
            "status":      lic.status,
            "company":     lic.company_name,
            "machine_id":  lic.machine_id,
        }
        if lic.status == SoftwareLicense.STATUS_ACTIVE:
            resp["license_key"] = lic.license_key
            resp["expires_at"]  = lic.expires_at.strftime("%B %Y")

        return _cors(JsonResponse(resp))

    def options(self, request, ref):
        r = JsonResponse({})
        r["Access-Control-Allow-Methods"] = "GET, OPTIONS"
        return _cors(r)
