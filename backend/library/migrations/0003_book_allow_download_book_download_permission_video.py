# Generated by Django 5.2.3 on 2025-06-14 20:29

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('library', '0002_book_available_copies_book_total_copies_borrowrecord'),
    ]

    operations = [
        migrations.AddField(
            model_name='book',
            name='allow_download',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='book',
            name='download_permission',
            field=models.CharField(choices=[('ALL', 'All Users'), ('AUTH', 'Authenticated Only'), ('NONE', 'None')], default='AUTH', max_length=10),
        ),
        migrations.CreateModel(
            name='Video',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('title', models.CharField(max_length=200)),
                ('description', models.TextField()),
                ('video_file', models.FileField(upload_to='videos/')),
                ('thumbnail', models.ImageField(upload_to='video_thumbnails/')),
                ('upload_date', models.DateTimeField(auto_now_add=True)),
                ('is_approved', models.BooleanField(default=False)),
                ('category', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, to='library.category')),
            ],
        ),
    ]
