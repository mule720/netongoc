from django.contrib import admin
from .models import (
    CompanyStats,
    Client,
    ConsultancyPlan,
    ConsultancyPlanTask,
    CompanyUpdate,
    ContactInfo,
    HeroContent,
    ContactRequest,
    ConsultancyRequest,
    HeroImage,
    Property,
    Service,
)


@admin.register(ContactRequest)
class ContactRequestAdmin(admin.ModelAdmin):
    list_display = ('name', 'email', 'company', 'service', 'status', 'created_at')
    list_filter = ('status',)
    search_fields = ('name', 'email', 'company', 'service', 'message')


@admin.register(ConsultancyRequest)
class ConsultancyRequestAdmin(admin.ModelAdmin):
    list_display = ('name', 'email', 'company', 'service', 'status', 'created_at')
    list_filter = ('status',)
    search_fields = ('name', 'email', 'company', 'service', 'message')


@admin.register(Property)
class PropertyAdmin(admin.ModelAdmin):
    list_display = ('title', 'property_type', 'price', 'location', 'is_featured', 'is_available', 'created_at')
    list_filter = ('property_type', 'is_featured', 'is_available')
    search_fields = ('title', 'location', 'address', 'description')


@admin.register(CompanyUpdate)
class CompanyUpdateAdmin(admin.ModelAdmin):
    list_display = ('title', 'is_published', 'created_at')
    list_filter = ('is_published',)
    search_fields = ('title', 'content')


@admin.register(Client)
class ClientAdmin(admin.ModelAdmin):
    list_display = ('name', 'industry', 'is_featured', 'created_at')
    list_filter = ('is_featured',)
    search_fields = ('name', 'industry')


@admin.register(CompanyStats)
class CompanyStatsAdmin(admin.ModelAdmin):
    list_display = ('client_satisfaction', 'years_experience', 'updated_at')


@admin.register(ContactInfo)
class ContactInfoAdmin(admin.ModelAdmin):
    list_display = ('field_name', 'field_value', 'field_type')
    list_filter = ('field_type',)
    search_fields = ('field_name', 'field_value')


@admin.register(HeroImage)
class HeroImageAdmin(admin.ModelAdmin):
    list_display = ('title', 'order', 'is_active', 'created_at')
    list_filter = ('is_active',)
    search_fields = ('title', 'description')


@admin.register(HeroContent)
class HeroContentAdmin(admin.ModelAdmin):
    list_display = ('heading', 'tagline', 'cta_text', 'overlay_color', 'overlay_opacity', 'order', 'is_active', 'created_at')
    list_filter = ('is_active',)
    search_fields = ('heading', 'tagline', 'description', 'cta_text', 'background_image_url')


@admin.register(Service)
class ServiceAdmin(admin.ModelAdmin):
    list_display = ('title', 'icon_key', 'order', 'is_active', 'created_at')
    list_filter = ('is_active',)
    search_fields = ('title', 'description', 'icon_key')


@admin.register(ConsultancyPlan)
class ConsultancyPlanAdmin(admin.ModelAdmin):
    list_display = ('consultancy_request', 'title', 'updated_at')
    search_fields = ('consultancy_request__name', 'consultancy_request__email', 'title')


@admin.register(ConsultancyPlanTask)
class ConsultancyPlanTaskAdmin(admin.ModelAdmin):
    list_display = ('task_title', 'plan', 'due_date', 'is_completed', 'order', 'updated_at')
    list_filter = ('is_completed',)
    search_fields = ('task_title', 'plan__consultancy_request__name')
