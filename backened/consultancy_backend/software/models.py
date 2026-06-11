import uuid
from django.db import models


class SoftwareProduct(models.Model):
    slug        = models.SlugField(max_length=60, unique=True)  # e.g. "neton_payroll"
    name        = models.CharField(max_length=120)
    description = models.TextField(blank=True)
    is_active   = models.BooleanField(default=True)

    class Meta:
        db_table = 'software_products'

    def __str__(self):
        return self.name


class SoftwareVersion(models.Model):
    id            = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    product       = models.ForeignKey(SoftwareProduct, on_delete=models.CASCADE, related_name='versions')
    version       = models.CharField(max_length=30)        # e.g. "1.2.0"
    release_notes = models.TextField(blank=True)
    file          = models.FileField(upload_to='software/')  # stored in GCS or local media
    file_name     = models.CharField(max_length=200, blank=True)  # original filename for download
    file_size_mb  = models.FloatField(default=0)
    is_latest     = models.BooleanField(default=False)
    is_active     = models.BooleanField(default=True)      # hide old versions if needed
    uploaded_at   = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'software_versions'
        ordering = ['-uploaded_at']

    def save(self, *args, **kwargs):
        # Ensure only one version is marked latest per product
        if self.is_latest:
            SoftwareVersion.objects.filter(
                product=self.product, is_latest=True
            ).exclude(pk=self.pk).update(is_latest=False)
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.product.name} v{self.version}"
