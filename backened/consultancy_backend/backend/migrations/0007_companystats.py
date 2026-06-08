from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('backend', '0006_herocontent_design_fields'),
    ]

    operations = [
        migrations.CreateModel(
            name='CompanyStats',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('client_satisfaction', models.CharField(default='98%', max_length=50)),
                ('years_experience', models.CharField(default='15+', max_length=50)),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
        ),
        migrations.RunPython(
            lambda apps, schema_editor: apps.get_model('backend', 'CompanyStats').objects.get_or_create(
                id=1,
                defaults={'client_satisfaction': '98%', 'years_experience': '15+'},
            ),
            migrations.RunPython.noop,
        ),
    ]
