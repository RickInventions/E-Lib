# Generated by Django 5.2.3 on 2025-06-16 00:55

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('library', '0013_readingsession'),
    ]

    operations = [
        migrations.RenameField(
            model_name='video',
            old_name='is_approved',
            new_name='is_featured',
        ),
        migrations.RemoveField(
            model_name='video',
            name='category',
        ),
        migrations.AddField(
            model_name='video',
            name='categories',
            field=models.ManyToManyField(to='library.category'),
        ),
        migrations.AddField(
            model_name='video',
            name='duration',
            field=models.PositiveIntegerField(default=0, help_text='Duration in seconds'),
        ),
        migrations.AddField(
            model_name='video',
            name='video_type',
            field=models.CharField(choices=[('TUTORIAL', 'Tutorial'), ('LECTURE', 'Lecture'), ('DOCUMENTARY', 'Documentary')], default=1, max_length=20),
            preserve_default=False,
        ),
        migrations.AlterField(
            model_name='video',
            name='thumbnail',
            field=models.ImageField(upload_to='video_thumbs/'),
        ),
    ]
