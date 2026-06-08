from django.db import models


class ContactRequest(models.Model):
    name = models.CharField(max_length=120)
    email = models.EmailField()
    company = models.CharField(max_length=200, blank=True)
    phone = models.CharField(max_length=50, blank=True)
    service = models.CharField(max_length=200, blank=True)
    message = models.TextField(blank=True)
    status = models.CharField(max_length=20, default='new')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} <{self.email}>"


class HeroImage(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    image_url = models.URLField()
    order = models.IntegerField(default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return f"{self.title}"


class HeroContent(models.Model):
    tagline = models.CharField(max_length=255)
    heading = models.CharField(max_length=255)
    description = models.TextField()
    cta_text = models.CharField(max_length=120, default='Get Started')
    background_image_url = models.URLField(blank=True)
    overlay_color = models.CharField(max_length=20, default='#000000')
    overlay_opacity = models.FloatField(default=0.6)
    order = models.IntegerField(default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['order', '-created_at']

    def __str__(self):
        return self.heading


class Service(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    icon_key = models.CharField(max_length=100, default='briefcase')
    service_areas = models.JSONField(default=list, blank=True)
    order = models.IntegerField(default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['order', 'created_at']

    def __str__(self):
        return self.title


class Property(models.Model):
    PROPERTY_TYPE_CHOICES = [
        ('house', 'House'),
        ('apartment', 'Apartment'),
        ('condo', 'Condo'),
        ('townhouse', 'Townhouse'),
        ('commercial', 'Commercial'),
        ('land', 'Land'),
    ]

    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    property_type = models.CharField(max_length=20, choices=PROPERTY_TYPE_CHOICES)
    price = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    location = models.CharField(max_length=300, blank=True)
    address = models.CharField(max_length=300, blank=True)
    latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    bedrooms = models.IntegerField(null=True, blank=True)
    bathrooms = models.IntegerField(null=True, blank=True)
    square_feet = models.IntegerField(null=True, blank=True)
    area = models.IntegerField(null=True, blank=True)
    image_url = models.URLField(null=True, blank=True)
    images = models.JSONField(default=list, blank=True)
    is_featured = models.BooleanField(default=False)
    is_available = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.title} - {self.location or self.address}"


class CompanyUpdate(models.Model):
    title = models.CharField(max_length=255)
    content = models.TextField(blank=True)
    image_url = models.URLField(blank=True)
    is_published = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.title


class Client(models.Model):
    name = models.CharField(max_length=200)
    logo = models.CharField(max_length=300, blank=True)
    industry = models.CharField(max_length=200, blank=True)
    is_featured = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return self.name


class CompanyStats(models.Model):
    client_satisfaction = models.CharField(max_length=50, default='98%')
    years_experience = models.CharField(max_length=50, default='15+')
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return 'Company Stats'


class ContactInfo(models.Model):
    FIELD_TYPE_CHOICES = [
        ('text', 'Text'),
        ('email', 'Email'),
        ('phone', 'Phone'),
        ('address', 'Address'),
    ]

    field_name = models.CharField(max_length=100)
    field_value = models.CharField(max_length=300)
    field_type = models.CharField(max_length=20, choices=FIELD_TYPE_CHOICES, default='text')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['field_name']

    def __str__(self):
        return f"{self.field_name}: {self.field_value}"


class ConsultancyRequest(models.Model):
    STATUS_CHOICES = [
        ('new', 'New'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
        ('archived', 'Archived'),
    ]

    name = models.CharField(max_length=120)
    email = models.EmailField()
    company = models.CharField(max_length=200, blank=True)
    phone = models.CharField(max_length=50, blank=True)
    service = models.CharField(max_length=200, blank=True)
    message = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='new')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.name} - {self.service}"


class ConsultancyPlan(models.Model):
    consultancy_request = models.OneToOneField(ConsultancyRequest, on_delete=models.CASCADE, related_name='plan')
    title = models.CharField(max_length=255, default='Project Plan', blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-updated_at']

    def __str__(self):
        return f"Plan - {self.consultancy_request.name}"


class ConsultancyPlanTask(models.Model):
    plan = models.ForeignKey(ConsultancyPlan, on_delete=models.CASCADE, related_name='tasks')
    task_title = models.CharField(max_length=255)
    due_date = models.DateField(null=True, blank=True)
    is_completed = models.BooleanField(default=False)
    order = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['order', 'due_date', 'created_at']

    def __str__(self):
        return self.task_title
