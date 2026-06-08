from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('backend', '0005_herocontent'),
    ]

    operations = [
        migrations.AddField(
            model_name='herocontent',
            name='background_image_url',
            field=models.URLField(blank=True),
        ),
        migrations.AddField(
            model_name='herocontent',
            name='overlay_color',
            field=models.CharField(default='#000000', max_length=20),
        ),
        migrations.AddField(
            model_name='herocontent',
            name='overlay_opacity',
            field=models.FloatField(default=0.6),
        ),
    ]
