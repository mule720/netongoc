from django.urls import path
from .views import (
    PlansView,
    InitiateLicenseView,
    LicenseWebhookView,
    SandboxConfirmView,
    LicenseStatusView,
    OnlineActivateView,
    HeartbeatView,
    TamperReportView,
    AdminGenerateView,
    AdminListView,
    AdminRevokeView,
)

urlpatterns = [
    # Purchase flow
    path('plans/',              PlansView.as_view(),             name='license-plans'),
    path('initiate/',           InitiateLicenseView.as_view(),   name='license-initiate'),
    path('webhook/',            LicenseWebhookView.as_view(),    name='license-webhook'),
    path('sandbox-confirm/',    SandboxConfirmView.as_view(),    name='license-sandbox-confirm'),
    path('status/<str:ref>/',   LicenseStatusView.as_view(),     name='license-status'),
    # Desktop security
    path('activate/',           OnlineActivateView.as_view(),    name='license-activate'),
    path('heartbeat/',          HeartbeatView.as_view(),         name='license-heartbeat'),
    path('tamper/',             TamperReportView.as_view(),      name='license-tamper'),
    # Admin
    path('admin/generate/',              AdminGenerateView.as_view(),        name='license-admin-generate'),
    path('admin/list/',                  AdminListView.as_view(),            name='license-admin-list'),
    path('admin/revoke/<str:license_id>/', AdminRevokeView.as_view(),        name='license-admin-revoke'),
]
