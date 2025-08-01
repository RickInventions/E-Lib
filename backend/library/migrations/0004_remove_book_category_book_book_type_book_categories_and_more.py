# Generated by Django 5.2.3 on 2025-06-14 23:56

import datetime
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('library', '0003_book_allow_download_book_download_permission_video'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='book',
            name='category',
        ),
        migrations.AddField(
            model_name='book',
            name='book_type',
            field=models.CharField(choices=[('PHYSICAL', 'Physical'), ('EBOOK', 'E-Book')], default='PHYSICAL', max_length=10),
        ),
        migrations.AddField(
            model_name='book',
            name='categories',
            field=models.ManyToManyField(to='library.category'),
        ),
        migrations.AddField(
            model_name='borrowrecord',
            name='due_date',
            field=models.DateTimeField(default=datetime.datetime(2025, 6, 14, 23, 56, 25, 94422, tzinfo=datetime.timezone.utc)),
            preserve_default=False,
        ),
        migrations.AlterField(
            model_name='user',
            name='first_name',
            field=models.CharField(max_length=30),
        ),
        migrations.AlterField(
            model_name='user',
            name='last_name',
            field=models.CharField(max_length=30),
        ),
    ]
