import uuid
import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = []

    operations = [
        migrations.CreateModel(
            name='SoftwareProduct',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('slug', models.SlugField(max_length=60, unique=True)),
                ('name', models.CharField(max_length=120)),
                ('description', models.TextField(blank=True)),
                ('is_active', models.BooleanField(default=True)),
            ],
            options={'db_table': 'software_products'},
        ),
        migrations.CreateModel(
            name='SoftwareVersion',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('version', models.CharField(max_length=30)),
                ('release_notes', models.TextField(blank=True)),
                ('file', models.FileField(upload_to='software/')),
                ('file_name', models.CharField(blank=True, max_length=200)),
                ('file_size_mb', models.FloatField(default=0)),
                ('is_latest', models.BooleanField(default=False)),
                ('is_active', models.BooleanField(default=True)),
                ('uploaded_at', models.DateTimeField(auto_now_add=True)),
                ('product', models.ForeignKey(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='versions',
                    to='software.softwareproduct',
                )),
            ],
            options={'db_table': 'software_versions', 'ordering': ['-uploaded_at']},
        ),
    ]
