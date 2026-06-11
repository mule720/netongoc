import uuid
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('licenses', '0001_initial'),
    ]

    operations = [
        # Widen machine_id to 64 chars (was 32)
        migrations.AlterField(
            model_name='softwarelicense',
            name='machine_id',
            field=models.CharField(db_index=True, max_length=64),
        ),
        # Make amount_zmw default to 0 (admin-generated keys have no payment)
        migrations.AlterField(
            model_name='softwarelicense',
            name='amount_zmw',
            field=models.DecimalField(decimal_places=2, default=0, max_digits=10),
        ),
        # Add revoked status choice
        migrations.AlterField(
            model_name='softwarelicense',
            name='status',
            field=models.CharField(
                choices=[
                    ('pending', 'Pending Payment'),
                    ('active', 'Active'),
                    ('expired', 'Expired'),
                    ('cancelled', 'Cancelled'),
                    ('revoked', 'Revoked'),
                ],
                default='pending', max_length=20,
            ),
        ),
        # Online session token
        migrations.AddField(
            model_name='softwarelicense',
            name='session_token',
            field=models.UUIDField(blank=True, db_index=True, null=True),
        ),
        # Telemetry
        migrations.AddField(
            model_name='softwarelicense',
            name='last_heartbeat',
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='softwarelicense',
            name='last_seen',
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='softwarelicense',
            name='ip_address',
            field=models.CharField(blank=True, max_length=45),
        ),
        migrations.AddField(
            model_name='softwarelicense',
            name='app_version',
            field=models.CharField(blank=True, max_length=30),
        ),
        # Security
        migrations.AddField(
            model_name='softwarelicense',
            name='tamper_count',
            field=models.PositiveIntegerField(default=0),
        ),
        migrations.AddField(
            model_name='softwarelicense',
            name='tamper_flag',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='softwarelicense',
            name='is_revoked',
            field=models.BooleanField(default=False),
        ),
        # Admin notes
        migrations.AddField(
            model_name='softwarelicense',
            name='notes',
            field=models.TextField(blank=True),
        ),
    ]
