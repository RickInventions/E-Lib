from django.contrib import admin
from .models import Book, Category, User

# Register models here
admin.site.register(Book)
admin.site.register(Category)
admin.site.register(User)