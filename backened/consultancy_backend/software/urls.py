from django.urls import path
from . import views

urlpatterns = [
    path('versions/',                    views.versions_list,        name='software-versions'),
    path('download/<uuid:version_id>/',  views.download_url,         name='software-download'),
    path('admin/request-upload/',            views.admin_request_upload,  name='software-admin-request-upload'),
    path('admin/confirm-upload/',            views.admin_confirm_upload,  name='software-admin-confirm-upload'),
    path('admin/upload/',                    views.admin_upload,          name='software-admin-upload'),
    path('admin/versions/',                  views.admin_versions_list,   name='software-admin-versions'),
    path('admin/toggle/<uuid:version_id>/',  views.admin_toggle_version,  name='software-admin-toggle'),
]
