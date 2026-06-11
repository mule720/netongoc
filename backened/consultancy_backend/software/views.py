import json
import os
from django.http import JsonResponse
from django.views.decorators.http import require_GET, require_POST
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.decorators import login_required
from django.core.files.base import ContentFile

from .models import SoftwareProduct, SoftwareVersion
from licenses.models import SoftwareLicense


def versions_list(request):
    """
    GET /api/software/versions/?product=neton_payroll
    Returns all active versions for a product (newest first).
    Public — no auth needed.
    """
    slug = request.GET.get('product', 'neton_payroll')
    try:
        product = SoftwareProduct.objects.get(slug=slug, is_active=True)
    except SoftwareProduct.DoesNotExist:
        return JsonResponse({'versions': []})

    versions = product.versions.filter(is_active=True).order_by('-uploaded_at')
    data = []
    for v in versions:
        data.append({
            'id': str(v.id),
            'version': v.version,
            'release_notes': v.release_notes,
            'file_name': v.file_name or os.path.basename(v.file.name),
            'file_size_mb': round(v.file_size_mb, 1),
            'is_latest': v.is_latest,
            'uploaded_at': v.uploaded_at.strftime('%Y-%m-%d'),
        })
    return JsonResponse({'product': product.name, 'versions': data})


@csrf_exempt
def download_url(request, version_id):
    """
    POST /api/software/download/<version_id>/
    Body: { "license_key": "XXXX-XXXX-XXXX-XXXX-XXXX" }
    Validates the license is active, returns the file URL.
    """
    if request.method != 'POST':
        return JsonResponse({'error': 'POST required'}, status=405)

    try:
        body = json.loads(request.body)
    except Exception:
        return JsonResponse({'error': 'Invalid JSON'}, status=400)

    key = (body.get('license_key') or '').strip().upper()
    if not key:
        return JsonResponse({'error': 'License key required'}, status=400)

    # Validate license
    try:
        license = SoftwareLicense.objects.get(license_key=key, status=SoftwareLicense.STATUS_ACTIVE)
    except SoftwareLicense.DoesNotExist:
        return JsonResponse({'error': 'Invalid or inactive license key. Please check your key or contact support.'}, status=403)

    try:
        version = SoftwareVersion.objects.get(id=version_id, is_active=True)
    except SoftwareVersion.DoesNotExist:
        return JsonResponse({'error': 'Version not found'}, status=404)

    # Return the file URL — GCS public URL or local media URL
    file_url = request.build_absolute_uri(version.file.url)
    return JsonResponse({
        'ok': True,
        'url': file_url,
        'file_name': version.file_name or os.path.basename(version.file.name),
        'version': version.version,
        'company': license.company_name,
    })


@csrf_exempt
def admin_upload(request):
    """
    POST /api/software/admin/upload/
    Multipart: product_slug, version, release_notes, is_latest, file
    Requires Django session auth (admin login).
    """
    if not request.user.is_authenticated or not request.user.is_staff:
        return JsonResponse({'error': 'Admin access required'}, status=403)

    if request.method != 'POST':
        return JsonResponse({'error': 'POST required'}, status=405)

    slug          = request.POST.get('product_slug', 'neton_payroll')
    version_str   = (request.POST.get('version') or '').strip()
    release_notes = (request.POST.get('release_notes') or '').strip()
    is_latest     = request.POST.get('is_latest', 'true').lower() == 'true'
    uploaded_file = request.FILES.get('file')

    if not version_str:
        return JsonResponse({'error': 'Version number required'}, status=400)
    if not uploaded_file:
        return JsonResponse({'error': 'File required'}, status=400)

    product, _ = SoftwareProduct.objects.get_or_create(
        slug=slug,
        defaults={'name': 'Neton Payroll Pro', 'description': 'Payroll software for Zambian businesses'}
    )

    # Calculate file size in MB
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

    return JsonResponse({
        'ok': True,
        'id': str(sv.id),
        'version': sv.version,
        'file_name': sv.file_name,
        'file_size_mb': round(size_mb, 1),
        'is_latest': sv.is_latest,
    })


@csrf_exempt
def admin_toggle_version(request, version_id):
    """
    POST /api/software/admin/toggle/<version_id>/
    Body: { "is_active": true/false, "is_latest": true/false }
    """
    if not request.user.is_authenticated or not request.user.is_staff:
        return JsonResponse({'error': 'Admin access required'}, status=403)

    try:
        body = json.loads(request.body)
    except Exception:
        return JsonResponse({'error': 'Invalid JSON'}, status=400)

    try:
        sv = SoftwareVersion.objects.get(id=version_id)
    except SoftwareVersion.DoesNotExist:
        return JsonResponse({'error': 'Not found'}, status=404)

    if 'is_active' in body:
        sv.is_active = bool(body['is_active'])
    if 'is_latest' in body:
        sv.is_latest = bool(body['is_latest'])
    sv.save()

    return JsonResponse({'ok': True})
