from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('backend', '0008_seed_default_clients'),
    ]

    operations = [
        migrations.CreateModel(
            name='ConsultancyPlan',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('title', models.CharField(blank=True, default='Project Plan', max_length=255)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('consultancy_request', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='plan', to='backend.consultancyrequest')),
            ],
            options={'ordering': ['-updated_at']},
        ),
        migrations.CreateModel(
            name='ConsultancyPlanTask',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('task_title', models.CharField(max_length=255)),
                ('due_date', models.DateField(blank=True, null=True)),
                ('is_completed', models.BooleanField(default=False)),
                ('order', models.IntegerField(default=0)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('plan', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='tasks', to='backend.consultancyplan')),
            ],
            options={'ordering': ['order', 'due_date', 'created_at']},
        ),
    ]
