import uuid
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = []

    operations = [
        migrations.CreateModel(
            name='SoftwareLicense',
            fields=[
                ('id',                 models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('product',            models.CharField(choices=[('neton_payroll', 'Neton Payroll')], default='neton_payroll', max_length=50)),
                ('company_name',       models.CharField(max_length=200)),
                ('contact_name',       models.CharField(max_length=200)),
                ('email',              models.EmailField()),
                ('phone',              models.CharField(blank=True, max_length=30)),
                ('machine_id',         models.CharField(db_index=True, max_length=32)),
                ('license_key',        models.CharField(blank=True, max_length=29)),
                ('months',             models.PositiveSmallIntegerField(default=12)),
                ('amount_zmw',         models.DecimalField(decimal_places=2, max_digits=10)),
                ('status',             models.CharField(choices=[('pending', 'Pending Payment'), ('active', 'Active'), ('expired', 'Expired'), ('cancelled', 'Cancelled')], default='pending', max_length=20)),
                ('payment_reference',  models.CharField(blank=True, db_index=True, max_length=100)),
                ('payment_session_id', models.CharField(blank=True, max_length=100)),
                ('expires_at',         models.DateField(blank=True, null=True)),
                ('activated_at',       models.DateTimeField(blank=True, null=True)),
                ('created_at',         models.DateTimeField(auto_now_add=True)),
                ('updated_at',         models.DateTimeField(auto_now=True)),
            ],
            options={'db_table': 'software_licenses', 'ordering': ['-created_at']},
        ),
    ]
