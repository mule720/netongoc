import json
import os
import uuid
from django.contrib.auth import authenticate, get_user_model, login, logout
from django.conf import settings
from django.core.files.storage import default_storage
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods

from .models import (
    Client,
    CompanyUpdate,
    ContactInfo,
    ContactRequest,
    ConsultancyRequest,
    Property,
)


def json_response(data, status=200, safe=True):
    return JsonResponse(data, status=status, safe=safe)


def parse_json(request):
    try:
        return json.loads(request.body.decode('utf-8'))
    except Exception:
        return None


def serialize_company_update(update):
    return {
        'id': update.id,
        'title': update.title,
        'content': update.content,
        'image_url': update.image_url,
        'is_published': update.is_published,
        'created_at': update.created_at.isoformat(),
        'updated_at': update.updated_at.isoformat(),
    }


def serialize_client(client):
    return {
        'id': client.id,
        'name': client.name,
        'logo': client.logo,
        'industry': client.industry,
        'is_featured': client.is_featured,
        'created_at': client.created_at.isoformat(),
        'updated_at': client.updated_at.isoformat(),
    }


def serialize_property(prop):
    return {
        'id': prop.id,
        'title': prop.title,
        'description': prop.description,
        'property_type': prop.property_type,
        'price': float(prop.price) if prop.price is not None else None,
        'location': prop.location,
        'address': prop.address,
        'latitude': float(prop.latitude) if prop.latitude is not None else None,
        'longitude': float(prop.longitude) if prop.longitude is not None else None,
        'bedrooms': prop.bedrooms,
        'bathrooms': prop.bathrooms,
        'square_feet': prop.square_feet,
        'area': prop.area,
        'image_url': prop.image_url,
        'images': prop.images or [],
        'is_featured': prop.is_featured,
        'is_available': prop.is_available,
        'created_at': prop.created_at.isoformat(),
        'updated_at': prop.updated_at.isoformat(),
    }


def serialize_contact_info(info):
    return {
        'id': info.id,
        'field_name': info.field_name,
        'field_value': info.field_value,
        'field_type': info.field_type,
        'created_at': info.created_at.isoformat(),
        'updated_at': info.updated_at.isoformat(),
    }


def serialize_consultancy_request(request_obj):
    return {
        'id': request_obj.id,
        'name': request_obj.name,
        'email': request_obj.email,
        'company': request_obj.company,
        'phone': request_obj.phone,
        'service': request_obj.service,
        'message': request_obj.message,
        'status': request_obj.status,
        'created_at': request_obj.created_at.isoformat(),
        'updated_at': request_obj.updated_at.isoformat(),
    }


def require_auth(request):
    if not request.user.is_authenticated:
        return json_response({'error': 'Authentication required'}, status=401)
    return None


@csrf_exempt
@require_http_methods(['POST'])
def auth_login(request):
    data = parse_json(request)
    if data is None:
        return json_response({'error': 'Invalid JSON'}, status=400)

    email = data.get('email')
    password = data.get('password')
    if not email or not password:
        return json_response({'error': 'Email and password are required'}, status=400)

    User = get_user_model()
    try:
        user = User.objects.get(email=email)
    except User.DoesNotExist:
        return json_response({'error': 'Invalid credentials'}, status=401)

    user = authenticate(request, username=user.username, password=password)
    if user is None:
        return json_response({'error': 'Invalid credentials'}, status=401)

    login(request, user)
    return json_response({'id': user.id, 'email': user.email, 'is_staff': user.is_staff})


@csrf_exempt
@require_http_methods(['POST'])
def auth_logout(request):
    logout(request)
    return json_response({'message': 'Logged out successfully'})


@require_http_methods(['GET'])
def auth_user(request):
    if not request.user.is_authenticated:
        return json_response({'error': 'Not authenticated'}, status=401)
    return json_response({'id': request.user.id, 'email': request.user.email, 'is_staff': request.user.is_staff})


@csrf_exempt
@require_http_methods(['GET', 'POST'])
def company_updates_list(request):
    if request.method == 'GET':
        published = request.GET.get('published') == 'true'
        updates = CompanyUpdate.objects.order_by('-created_at')
        if published:
            updates = updates.filter(is_published=True)
        return json_response([serialize_company_update(update) for update in updates], safe=False)

    auth_error = require_auth(request)
    if auth_error:
        return auth_error

    data = parse_json(request)
    if data is None:
        return json_response({'error': 'Invalid JSON'}, status=400)

    update = CompanyUpdate.objects.create(
        title=data.get('title', ''),
        content=data.get('content', ''),
        image_url=data.get('image_url', ''),
        is_published=bool(data.get('is_published', False)),
    )
    return json_response(serialize_company_update(update), status=201)


@csrf_exempt
@require_http_methods(['GET', 'PUT', 'DELETE'])
def company_update_detail(request, update_id):
    try:
        update = CompanyUpdate.objects.get(id=update_id)
    except CompanyUpdate.DoesNotExist:
        return json_response({'error': 'Company update not found'}, status=404)

    if request.method == 'GET':
        return json_response(serialize_company_update(update))

    auth_error = require_auth(request)
    if auth_error:
        return auth_error

    if request.method == 'DELETE':
        update.delete()
        return json_response({'success': True})

    data = parse_json(request)
    if data is None:
        return json_response({'error': 'Invalid JSON'}, status=400)

    update.title = data.get('title', update.title)
    update.content = data.get('content', update.content)
    update.image_url = data.get('image_url', update.image_url)
    if 'is_published' in data:
        update.is_published = bool(data.get('is_published'))
    update.save()
    return json_response(serialize_company_update(update))


@csrf_exempt
@require_http_methods(['GET', 'POST'])
def clients_list(request):
    if request.method == 'GET':
        featured = request.GET.get('featured') == 'true'
        clients = Client.objects.order_by('name')
        if featured:
            clients = clients.filter(is_featured=True)
        return json_response([serialize_client(client) for client in clients], safe=False)

    auth_error = require_auth(request)
    if auth_error:
        return auth_error

    data = parse_json(request)
    if data is None:
        return json_response({'error': 'Invalid JSON'}, status=400)

    client = Client.objects.create(
        name=data.get('name', ''),
        logo=data.get('logo', ''),
        industry=data.get('industry', ''),
        is_featured=bool(data.get('is_featured', False)),
    )
    return json_response(serialize_client(client), status=201)


@csrf_exempt
@require_http_methods(['GET', 'PUT', 'DELETE'])
def client_detail(request, client_id):
    try:
        client = Client.objects.get(id=client_id)
    except Client.DoesNotExist:
        return json_response({'error': 'Client not found'}, status=404)

    if request.method == 'GET':
        return json_response(serialize_client(client))

    auth_error = require_auth(request)
    if auth_error:
        return auth_error

    if request.method == 'DELETE':
        client.delete()
        return json_response({'success': True})

    data = parse_json(request)
    if data is None:
        return json_response({'error': 'Invalid JSON'}, status=400)

    client.name = data.get('name', client.name)
    client.logo = data.get('logo', client.logo)
    client.industry = data.get('industry', client.industry)
    if 'is_featured' in data:
        client.is_featured = bool(data.get('is_featured'))
    client.save()
    return json_response(serialize_client(client))


@csrf_exempt
@require_http_methods(['GET', 'POST'])
def properties_list(request):
    if request.method == 'GET':
        available = request.GET.get('available')
        featured = request.GET.get('featured')
        properties = Property.objects.order_by('-created_at')
        if available == 'true':
            properties = properties.filter(is_available=True)
        if featured == 'true':
            properties = properties.filter(is_featured=True)
        return json_response([serialize_property(prop) for prop in properties], safe=False)

    auth_error = require_auth(request)
    if auth_error:
        return auth_error

    data = parse_json(request)
    if data is None:
        return json_response({'error': 'Invalid JSON'}, status=400)

    property_obj = Property.objects.create(
        title=data.get('title', ''),
        description=data.get('description', ''),
        property_type=data.get('property_type', ''),
        price=data.get('price'),
        location=data.get('location', ''),
        address=data.get('address', ''),
        latitude=data.get('latitude'),
        longitude=data.get('longitude'),
        bedrooms=data.get('bedrooms'),
        bathrooms=data.get('bathrooms'),
        square_feet=data.get('square_feet'),
        area=data.get('area'),
        image_url=data.get('image_url', ''),
        images=data.get('images') or [],
        is_featured=bool(data.get('is_featured', False)),
        is_available=bool(data.get('is_available', True)),
    )
    return json_response(serialize_property(property_obj), status=201)


@csrf_exempt
@require_http_methods(['GET', 'PUT', 'DELETE'])
def property_detail(request, property_id):
    try:
        property_obj = Property.objects.get(id=property_id)
    except Property.DoesNotExist:
        return json_response({'error': 'Property not found'}, status=404)

    if request.method == 'GET':
        return json_response(serialize_property(property_obj))

    auth_error = require_auth(request)
    if auth_error:
        return auth_error

    if request.method == 'DELETE':
        property_obj.delete()
        return json_response({'success': True})

    data = parse_json(request)
    if data is None:
        return json_response({'error': 'Invalid JSON'}, status=400)

    property_obj.title = data.get('title', property_obj.title)
    property_obj.description = data.get('description', property_obj.description)
    property_obj.property_type = data.get('property_type', property_obj.property_type)
    property_obj.price = data.get('price') if data.get('price') is not None else property_obj.price
    property_obj.location = data.get('location', property_obj.location)
    property_obj.address = data.get('address', property_obj.address)
    property_obj.latitude = data.get('latitude') if data.get('latitude') is not None else property_obj.latitude
    property_obj.longitude = data.get('longitude') if data.get('longitude') is not None else property_obj.longitude
    property_obj.bedrooms = data.get('bedrooms') if data.get('bedrooms') is not None else property_obj.bedrooms
    property_obj.bathrooms = data.get('bathrooms') if data.get('bathrooms') is not None else property_obj.bathrooms
    property_obj.square_feet = data.get('square_feet') if data.get('square_feet') is not None else property_obj.square_feet
    property_obj.area = data.get('area') if data.get('area') is not None else property_obj.area
    property_obj.image_url = data.get('image_url', property_obj.image_url)
    if 'images' in data:
        property_obj.images = data.get('images') or []
    if 'is_featured' in data:
        property_obj.is_featured = bool(data.get('is_featured'))
    if 'is_available' in data:
        property_obj.is_available = bool(data.get('is_available'))
    property_obj.save()
    return json_response(serialize_property(property_obj))


@csrf_exempt
@require_http_methods(['GET', 'POST'])
def consultancy_requests_list(request):
    if request.method == 'GET':
        requests = ConsultancyRequest.objects.order_by('-created_at')
        return json_response([serialize_consultancy_request(r) for r in requests], safe=False)

    data = parse_json(request)
    if data is None:
        return json_response({'error': 'Invalid JSON'}, status=400)

    request_obj = ConsultancyRequest.objects.create(
        name=data.get('name', ''),
        email=data.get('email', ''),
        company=data.get('company', ''),
        phone=data.get('phone', ''),
        service=data.get('service', ''),
        message=data.get('message', ''),
        status=data.get('status', 'new'),
    )
    return json_response(serialize_consultancy_request(request_obj), status=201)


@csrf_exempt
@require_http_methods(['GET', 'PUT', 'DELETE'])
def consultancy_request_detail(request, request_id):
    try:
        request_obj = ConsultancyRequest.objects.get(id=request_id)
    except ConsultancyRequest.DoesNotExist:
        return json_response({'error': 'Consultancy request not found'}, status=404)

    if request.method == 'GET':
        return json_response(serialize_consultancy_request(request_obj))

    auth_error = require_auth(request)
    if auth_error:
        return auth_error

    if request.method == 'DELETE':
        request_obj.delete()
        return json_response({'success': True})

    data = parse_json(request)
    if data is None:
        return json_response({'error': 'Invalid JSON'}, status=400)

    request_obj.status = data.get('status', request_obj.status)
    request_obj.save()
    return json_response(serialize_consultancy_request(request_obj))


@csrf_exempt
@require_http_methods(['GET', 'POST'])
def contact_info_list(request):
    if request.method == 'GET':
        info = ContactInfo.objects.order_by('field_name')
        return json_response([serialize_contact_info(item) for item in info], safe=False)

    auth_error = require_auth(request)
    if auth_error:
        return auth_error

    data = parse_json(request)
    if data is None:
        return json_response({'error': 'Invalid JSON'}, status=400)

    info = ContactInfo.objects.create(
        field_name=data.get('field_name', ''),
        field_value=data.get('field_value', ''),
        field_type=data.get('field_type', 'text'),
    )
    return json_response(serialize_contact_info(info), status=201)


@csrf_exempt
@require_http_methods(['GET', 'PUT', 'DELETE'])
def contact_info_detail(request, info_id):
    try:
        info = ContactInfo.objects.get(id=info_id)
    except ContactInfo.DoesNotExist:
        return json_response({'error': 'Contact info not found'}, status=404)

    if request.method == 'GET':
        return json_response(serialize_contact_info(info))

    auth_error = require_auth(request)
    if auth_error:
        return auth_error

    if request.method == 'DELETE':
        info.delete()
        return json_response({'success': True})

    data = parse_json(request)
    if data is None:
        return json_response({'error': 'Invalid JSON'}, status=400)

    info.field_name = data.get('field_name', info.field_name)
    info.field_value = data.get('field_value', info.field_value)
    info.field_type = data.get('field_type', info.field_type)
    info.save()
    return json_response(serialize_contact_info(info))


@csrf_exempt
@require_http_methods(['POST'])
def contact_create(request):
    data = parse_json(request)
    if data is None:
        return json_response({'error': 'Invalid JSON'}, status=400)

    name = data.get('name')
    email = data.get('email')
    message = data.get('message', '')

    if not name or not email:
        return json_response({'error': 'name and email are required'}, status=400)

    contact = ContactRequest.objects.create(name=name, email=email, message=message)
    return json_response({'id': contact.id, 'name': contact.name, 'email': contact.email, 'created_at': contact.created_at.isoformat()})


@csrf_exempt
@require_http_methods(['POST'])
def property_image_upload(request):
    auth_error = require_auth(request)
    if auth_error:
        return auth_error

    file_obj = request.FILES.get('file')
    if not file_obj:
        return json_response({'error': 'No file uploaded. Expected form-data key: file'}, status=400)

    allowed_exts = {'.jpg', '.jpeg', '.png', '.webp', '.gif'}
    ext = os.path.splitext(file_obj.name)[1].lower()
    if ext not in allowed_exts:
        return json_response({'error': 'Unsupported file type. Use jpg, jpeg, png, webp, or gif.'}, status=400)

    filename = f"property_{uuid.uuid4().hex}{ext}"
    relative_path = os.path.join('property_images', filename)
    saved_path = default_storage.save(relative_path, file_obj)

    media_url = settings.MEDIA_URL.rstrip('/') + '/'
    absolute_url = request.build_absolute_uri(media_url + saved_path.replace('\\', '/'))

    return json_response({'success': True, 'url': absolute_url})


@csrf_exempt
@require_http_methods(['POST'])
def hero_background_upload(request):
    auth_error = require_auth(request)
    if auth_error:
        return auth_error

    file_obj = request.FILES.get('file')
    if not file_obj:
        return json_response({'error': 'No file uploaded. Expected form-data key: file'}, status=400)

    allowed_exts = {'.jpg', '.jpeg', '.png', '.webp', '.gif'}
    ext = os.path.splitext(file_obj.name)[1].lower()
    if ext not in allowed_exts:
        return json_response({'error': 'Unsupported file type. Use jpg, jpeg, png, webp, or gif.'}, status=400)

    filename = f"hero_bg_{uuid.uuid4().hex}{ext}"
    relative_path = os.path.join('hero_backgrounds', filename)
    saved_path = default_storage.save(relative_path, file_obj)

    media_url = settings.MEDIA_URL.rstrip('/') + '/'
    absolute_url = request.build_absolute_uri(media_url + saved_path.replace('\\', '/'))

    return json_response({'success': True, 'url': absolute_url})
