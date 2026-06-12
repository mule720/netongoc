import datetime
import json
import os
import requests as http_requests
from django.conf import settings
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt

from .models import SoftwareProduct, SoftwareVersion
from licenses.models import SoftwareLicense


_ALLOWED_ORIGINS = {
    "https://netongoc.com",
    "https://www.netongoc.com",
}


def _cors(response, request=None):
    origin = (request.headers.get("Origin") or "") if request else ""
    allowed = origin if origin in _ALLOWED_ORIGINS else "https://netongoc.com"
    response["Access-Control-Allow-Origin"] = allowed
    response["Access-Control-Allow-Credentials"] = "true"
    response["Access-Control-Allow-Headers"] = "Content-Type, X-CSRFToken"
    response["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
    return response


def versions_list(request):
    """GET /api/software/versions/?product=neton_payroll — public."""
    if request.method == 'OPTIONS':
        return _cors(JsonResponse({}), request)

    slug = request.GET.get('product', 'neton_payroll')
    try:
        product = SoftwareProduct.objects.get(slug=slug, is_active=True)
    except SoftwareProduct.DoesNotExist:
        return _cors(JsonResponse({'versions': []}), request)
    except Exception as e:
        return _cors(JsonResponse({'error': str(e), 'versions': []}, status=500), request)

    versions = product.versions.filter(is_active=True).order_by('-uploaded_at')
    data = []
    for v in versions:
        try:
            fname = v.file_name or os.path.basename(v.file.name)
        except Exception:
            fname = v.file_name or ''
        data.append({
            'id': str(v.id),
            'version': v.version,
            'release_notes': v.release_notes,
            'file_name': fname,
            'file_size_mb': round(v.file_size_mb, 1),
            'is_latest': v.is_latest,
            'uploaded_at': v.uploaded_at.strftime('%Y-%m-%d'),
        })
    return _cors(JsonResponse({'product': product.name, 'versions': data}), request)


@csrf_exempt
def download_url(request, version_id):
    """POST /api/software/download/<version_id>/ — validates license key, returns file URL."""
    if request.method == 'OPTIONS':
        return _cors(JsonResponse({}), request)

    if request.method != 'POST':
        return _cors(JsonResponse({'error': 'POST required'}, status=405), request)

    try:
        body = json.loads(request.body)
    except Exception:
        return _cors(JsonResponse({'error': 'Invalid JSON'}, status=400), request)

    key = (body.get('license_key') or '').strip().upper()
    if not key:
        return _cors(JsonResponse({'error': 'License key required'}, status=400), request)

    try:
        lic = SoftwareLicense.objects.get(license_key=key, status=SoftwareLicense.STATUS_ACTIVE)
    except SoftwareLicense.DoesNotExist:
        return _cors(JsonResponse({'error': 'Invalid or inactive license key. Please check your key or contact support.'}, status=403), request)

    if lic.is_revoked:
        return _cors(JsonResponse({'error': 'This license has been revoked. Contact support.'}, status=403), request)

    try:
        version = SoftwareVersion.objects.get(id=version_id, is_active=True)
    except SoftwareVersion.DoesNotExist:
        return _cors(JsonResponse({'error': 'Version not found'}, status=404), request)

    file_url = request.build_absolute_uri(version.file.url)
    return _cors(JsonResponse({
        'ok': True,
        'url': file_url,
        'file_name': version.file_name or os.path.basename(version.file.name),
        'version': version.version,
        'company': lic.company_name,
    }), request)


@csrf_exempt
def admin_upload(request):
    """POST /api/software/admin/upload/ — staff only, multipart file upload."""
    if request.method == 'OPTIONS':
        return _cors(JsonResponse({}), request)

    if not request.user.is_authenticated or not request.user.is_staff:
        return _cors(JsonResponse({'error': 'Admin access required'}, status=403), request)

    if request.method != 'POST':
        return _cors(JsonResponse({'error': 'POST required'}, status=405), request)

    slug          = request.POST.get('product_slug', 'neton_payroll')
    version_str   = (request.POST.get('version') or '').strip()
    release_notes = (request.POST.get('release_notes') or '').strip()
    is_latest     = request.POST.get('is_latest', 'true').lower() == 'true'
    uploaded_file = request.FILES.get('file')

    if not version_str:
        return _cors(JsonResponse({'error': 'Version number required'}, status=400), request)
    if not uploaded_file:
        return _cors(JsonResponse({'error': 'File required'}, status=400), request)

    product, _ = SoftwareProduct.objects.get_or_create(
        slug=slug,
        defaults={'name': 'Neton Payroll Pro', 'description': 'Payroll software for Zambian businesses'}
    )

    size_mb = uploaded_file.size / (1024 * 1024)
    sv = SoftwareVersion(
        product=product,
        version=version_str,
        release_notes=release_notes,
        file_name=uploaded_file.name,
        file_size_mb=size_mb,
        is_latest=is_latest,
        is_active=True,
    )
    sv.file.save(f'software/{slug}_v{version_str}_{uploaded_file.name}', uploaded_file, save=True)

    return _cors(JsonResponse({
        'ok': True,
        'id': str(sv.id),
        'version': sv.version,
        'file_name': sv.file_name,
        'file_size_mb': round(size_mb, 1),
        'is_latest': sv.is_latest,
    }), request)


@csrf_exempt
def admin_request_upload(request):
    """
    POST /api/software/admin/request-upload/
    Body: { "file_name": "setup.exe", "content_type": "application/octet-stream",
            "version": "1.0.0", "release_notes": "...", "is_latest": true, "product_slug": "neton_payroll" }
    Returns a GCS signed URL the browser uploads to directly (bypasses Cloud Run 32 MB limit).
    """
    if request.method == 'OPTIONS':
        return _cors(JsonResponse({}), request)

    if not request.user.is_authenticated or not request.user.is_staff:
        return _cors(JsonResponse({'error': 'Admin access required'}, status=403), request)

    try:
        body = json.loads(request.body)
    except Exception:
        return _cors(JsonResponse({'error': 'Invalid JSON'}, status=400), request)

    file_name    = (body.get('file_name') or '').strip()
    content_type = (body.get('content_type') or 'application/octet-stream').strip()
    version_str  = (body.get('version') or '').strip()
    release_notes = (body.get('release_notes') or '').strip()
    is_latest    = bool(body.get('is_latest', True))
    slug         = (body.get('product_slug') or 'neton_payroll').strip()

    if not file_name or not version_str:
        return _cors(JsonResponse({'error': 'file_name and version are required'}, status=400), request)

    bucket_name  = getattr(settings, 'GS_BUCKET_NAME', os.environ.get('GCS_MEDIA_BUCKET', ''))
    if not bucket_name:
        return _cors(JsonResponse({'error': 'GCS bucket not configured'}, status=500), request)

    gcs_path = f'software/{slug}_v{version_str}_{file_name}'

    # Generate signed URL via Cloud Run metadata server (no key file needed)
    try:
        # Get access token from metadata server
        token_resp = http_requests.get(
            'http://metadata.google.internal/computeMetadata/v1/instance/service-accounts/default/token',
            headers={'Metadata-Flavor': 'Google'},
            timeout=5,
        )
        token_resp.raise_for_status()
        access_token = token_resp.json()['access_token']

        # Get service account email
        sa_resp = http_requests.get(
            'http://metadata.google.internal/computeMetadata/v1/instance/service-accounts/default/email',
            headers={'Metadata-Flavor': 'Google'},
            timeout=5,
        )
        sa_resp.raise_for_status()
        service_account_email = sa_resp.text.strip()

        from google.cloud import storage
        from google.oauth2.credentials import Credentials

        creds = Credentials(token=access_token)
        client = storage.Client(credentials=creds, project=os.environ.get('GOOGLE_CLOUD_PROJECT', ''))
        bucket = client.bucket(bucket_name)
        blob   = bucket.blob(gcs_path)

        signed_url = blob.generate_signed_url(
            version='v4',
            expiration=datetime.timedelta(minutes=60),
            method='PUT',
            content_type=content_type,
            service_account_email=service_account_email,
            access_token=access_token,
        )

        return _cors(JsonResponse({
            'ok':           True,
            'upload_url':   signed_url,
            'gcs_path':     gcs_path,
            'version':      version_str,
            'release_notes': release_notes,
            'is_latest':    is_latest,
            'product_slug': slug,
            'file_name':    file_name,
            'content_type': content_type,
        }), request)

    except Exception as exc:
        return _cors(JsonResponse({'error': f'Could not generate upload URL: {exc}'}, status=500), request)


@csrf_exempt
def admin_confirm_upload(request):
    """
    POST /api/software/admin/confirm-upload/
    Called after the browser finishes uploading to GCS.
    Body: { "gcs_path": "software/...", "version": "1.0", "release_notes": "...",
            "is_latest": true, "product_slug": "neton_payroll", "file_name": "setup.exe",
            "file_size_mb": 45.2 }
    Creates the SoftwareVersion record pointing at the GCS object.
    """
    if request.method == 'OPTIONS':
        return _cors(JsonResponse({}), request)

    if not request.user.is_authenticated or not request.user.is_staff:
        return _cors(JsonResponse({'error': 'Admin access required'}, status=403), request)

    try:
        body = json.loads(request.body)
    except Exception:
        return _cors(JsonResponse({'error': 'Invalid JSON'}, status=400), request)

    gcs_path     = (body.get('gcs_path') or '').strip()
    version_str  = (body.get('version') or '').strip()
    release_notes = (body.get('release_notes') or '').strip()
    is_latest    = bool(body.get('is_latest', True))
    slug         = (body.get('product_slug') or 'neton_payroll').strip()
    file_name    = (body.get('file_name') or '').strip()
    file_size_mb = float(body.get('file_size_mb') or 0)

    if not gcs_path or not version_str:
        return _cors(JsonResponse({'error': 'gcs_path and version required'}, status=400), request)

    product, _ = SoftwareProduct.objects.get_or_create(
        slug=slug,
        defaults={'name': 'Neton Payroll Pro', 'description': 'Payroll software for Zambian businesses'}
    )

    sv = SoftwareVersion(
        product=product,
        version=version_str,
        release_notes=release_notes,
        file_name=file_name,
        file_size_mb=file_size_mb,
        is_latest=is_latest,
        is_active=True,
    )
    # Set the file field to point at the GCS path directly (no re-upload)
    sv.file.name = gcs_path
    sv.save()

    return _cors(JsonResponse({
        'ok':          True,
        'id':          str(sv.id),
        'version':     sv.version,
        'file_name':   sv.file_name,
        'is_latest':   sv.is_latest,
    }), request)


@csrf_exempt
def admin_versions_list(request):
    """GET /api/software/admin/versions/ — staff only, all versions including inactive."""
    if request.method == 'OPTIONS':
        return _cors(JsonResponse({}), request)

    if not request.user.is_authenticated or not request.user.is_staff:
        return _cors(JsonResponse({'error': 'Admin access required'}, status=403), request)

    slug = request.GET.get('product', 'neton_payroll')
    try:
        product = SoftwareProduct.objects.get(slug=slug)
    except SoftwareProduct.DoesNotExist:
        return _cors(JsonResponse({'versions': []}), request)

    data = []
    for v in product.versions.all().order_by('-uploaded_at'):
        try:
            fname = v.file_name or os.path.basename(v.file.name)
        except Exception:
            fname = v.file_name or ''
        data.append({
            'id': str(v.id),
            'version': v.version,
            'release_notes': v.release_notes,
            'file_name': fname,
            'file_size_mb': round(v.file_size_mb, 1),
            'is_latest': v.is_latest,
            'is_active': v.is_active,
            'uploaded_at': v.uploaded_at.strftime('%Y-%m-%d'),
        })
    return _cors(JsonResponse({'product': product.name, 'versions': data}), request)


@csrf_exempt
def admin_toggle_version(request, version_id):
    """POST /api/software/admin/toggle/<version_id>/"""
    if request.method == 'OPTIONS':
        return _cors(JsonResponse({}), request)

    if not request.user.is_authenticated or not request.user.is_staff:
        return _cors(JsonResponse({'error': 'Admin access required'}, status=403), request)

    try:
        body = json.loads(request.body)
    except Exception:
        return _cors(JsonResponse({'error': 'Invalid JSON'}, status=400), request)

    try:
        sv = SoftwareVersion.objects.get(id=version_id)
    except SoftwareVersion.DoesNotExist:
        return _cors(JsonResponse({'error': 'Not found'}, status=404), request)

    if 'is_active' in body:
        sv.is_active = bool(body['is_active'])
    if 'is_latest' in body:
        sv.is_latest = bool(body['is_latest'])
    sv.save()

    return _cors(JsonResponse({'ok': True}), request)
