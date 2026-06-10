from django.urls import path
from .views import (
    PlansView,
    InitiateLicenseView,
    LicenseWebhookView,
    SandboxConfirmView,
    LicenseStatusView,
)

urlpatterns = [
    path('plans/',            PlansView.as_view(),           name='license-plans'),
    path('initiate/',         InitiateLicenseView.as_view(), name='license-initiate'),
    path('webhook/',          LicenseWebhookView.as_view(),  name='license-webhook'),
    path('sandbox-confirm/',  SandboxConfirmView.as_view(),  name='license-sandbox-confirm'),
    path('status/<str:ref>/', LicenseStatusView.as_view(),   name='license-status'),
]
