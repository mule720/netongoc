from django.db import migrations, models


def seed_default_hero_content(apps, schema_editor):
    HeroContent = apps.get_model('backend', 'HeroContent')
    if HeroContent.objects.exists():
        return

    HeroContent.objects.create(
        tagline='Growth · Strategy · Execution',
        heading='Empowering Your Business Success',
        description='Dynamic business support and consultancy services delivering exceptional solutions for growth, efficiency, and sustainability.',
        cta_text='Get Started',
        order=1,
        is_active=True,
    )


def remove_default_hero_content(apps, schema_editor):
    HeroContent = apps.get_model('backend', 'HeroContent')
    HeroContent.objects.filter(
        heading='Empowering Your Business Success',
        tagline='Growth · Strategy · Execution'
    ).delete()


class Migration(migrations.Migration):

    dependencies = [
        ('backend', '0004_seed_default_services'),
    ]

    operations = [
        migrations.CreateModel(
            name='HeroContent',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('tagline', models.CharField(max_length=255)),
                ('heading', models.CharField(max_length=255)),
                ('description', models.TextField()),
                ('cta_text', models.CharField(default='Get Started', max_length=120)),
                ('order', models.IntegerField(default=0)),
                ('is_active', models.BooleanField(default=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
            options={
                'ordering': ['order', '-created_at'],
            },
        ),
        migrations.RunPython(seed_default_hero_content, remove_default_hero_content),
    ]
