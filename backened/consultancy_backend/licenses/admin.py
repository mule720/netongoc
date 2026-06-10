from django.contrib import admin
from .models import SoftwareLicense


@admin.register(SoftwareLicense)
class SoftwareLicenseAdmin(admin.ModelAdmin):
    list_display  = ('company_name', 'contact_name', 'email', 'machine_id', 'license_key', 'status', 'expires_at', 'created_at')
    list_filter   = ('status', 'product', 'months')
    search_fields = ('company_name', 'email', 'machine_id', 'license_key', 'payment_reference')
    readonly_fields = ('id', 'created_at', 'updated_at', 'activated_at')
    ordering      = ('-created_at',)
