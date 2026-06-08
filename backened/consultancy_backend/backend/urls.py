from django.urls import path
from . import views

urlpatterns = [
    path('api/uploads/hero-background/', views.hero_background_upload, name='hero_background_upload'),
    path('api/uploads/property-image/', views.property_image_upload, name='property_image_upload'),
]
