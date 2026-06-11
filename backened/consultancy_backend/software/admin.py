from django.contrib import admin
from .models import SoftwareProduct, SoftwareVersion


@admin.register(SoftwareProduct)
class SoftwareProductAdmin(admin.ModelAdmin):
    list_display = ['name', 'slug', 'is_active']


@admin.register(SoftwareVersion)
class SoftwareVersionAdmin(admin.ModelAdmin):
    list_display = ['product', 'version', 'file_name', 'file_size_mb', 'is_latest', 'is_active', 'uploaded_at']
    list_filter  = ['product', 'is_latest', 'is_active']
    ordering     = ['-uploaded_at']
