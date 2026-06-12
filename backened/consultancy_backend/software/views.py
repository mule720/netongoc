import json
import os
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
