import uuid
from django.db import models


class SoftwareLicense(models.Model):
    PRODUCT_PAYROLL = 'neton_payroll'
    PRODUCTS = [(PRODUCT_PAYROLL, 'Neton Payroll')]

    STATUS_PENDING   = 'pending'
    STATUS_ACTIVE    = 'active'
    STATUS_EXPIRED   = 'expired'
    STATUS_CANCELLED = 'cancelled'
    STATUSES = [
        (STATUS_PENDING,   'Pending Payment'),
        (STATUS_ACTIVE,    'Active'),
        (STATUS_EXPIRED,   'Expired'),
        (STATUS_CANCELLED, 'Cancelled'),
    ]

    id               = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    product          = models.CharField(max_length=50, choices=PRODUCTS, default=PRODUCT_PAYROLL)
    company_name     = models.CharField(max_length=200)
    contact_name     = models.CharField(max_length=200)
    email            = models.EmailField()
    phone            = models.CharField(max_length=30, blank=True)
    machine_id       = models.CharField(max_length=32, db_index=True)
    license_key      = models.CharField(max_length=29, blank=True)  # XXXX-XXXX-XXXX-XXXX-XXXX
    months           = models.PositiveSmallIntegerField(default=12)
    amount_zmw       = models.DecimalField(max_digits=10, decimal_places=2)
    status           = models.CharField(max_length=20, choices=STATUSES, default=STATUS_PENDING)

    # Payment tracking — filled when payment system confirms
    payment_reference = models.CharField(max_length=100, blank=True, db_index=True)
    payment_session_id = models.CharField(max_length=100, blank=True)

    expires_at       = models.DateField(null=True, blank=True)
    activated_at     = models.DateTimeField(null=True, blank=True)
    created_at       = models.DateTimeField(auto_now_add=True)
    updated_at       = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'software_licenses'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.company_name} | {self.machine_id} | {self.status}"
