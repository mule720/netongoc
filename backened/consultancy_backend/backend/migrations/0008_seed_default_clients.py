from django.db import migrations


def seed_default_clients(apps, schema_editor):
    Client = apps.get_model('backend', 'Client')
    defaults = [
        ('TechCorp Solutions', '🏢', 'Technology'),
        ('Global Manufacturing Ltd', '🏭', 'Manufacturing'),
        ('Retail Dynamics', '🛍️', 'Retail'),
        ('Healthcare Plus', '🏥', 'Healthcare'),
        ('Finance First', '💼', 'Finance'),
        ('Construction Pro', '🏗️', 'Construction'),
        ('Education Hub', '🎓', 'Education'),
        ('Logistics Express', '🚚', 'Logistics'),
        ('Energy Solutions', '⚡', 'Energy'),
        ('Food & Beverage Co', '🍽️', 'Food & Beverage'),
        ('Real Estate Group', '🏠', 'Real Estate'),
        ('Media Networks', '📺', 'Media'),
    ]

    for name, logo, industry in defaults:
        Client.objects.get_or_create(
            name=name,
            defaults={
                'logo': logo,
                'industry': industry,
                'is_featured': True,
            },
        )


class Migration(migrations.Migration):

    dependencies = [
        ('backend', '0007_companystats'),
    ]

    operations = [
        migrations.RunPython(seed_default_clients, migrations.RunPython.noop),
    ]
