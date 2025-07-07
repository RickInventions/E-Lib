from django.utils import timezone
from django.contrib import admin
from .models import Book, Category, FeaturedBook, User, Video
from django.contrib.auth.admin import UserAdmin

class CustomUserAdmin(UserAdmin):
    fieldsets = (
        (None, {'fields': ('username', 'password')}),
        ('Personal info', {'fields': ('first_name', 'last_name', 'email')}),
        ('Permissions', {'fields': ('role', 'is_active', 'is_staff', 'is_superuser')}),
        ('Important dates', {'fields': ('last_login', 'date_joined')}),
    )
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('username', 'first_name', 'last_name', 'password1', 'password2', 'role','email'),
        }),
    )
    list_display = ('username', 'email', 'first_name', 'last_name', 'role')
    list_filter = ('role', 'is_staff', 'is_superuser', 'is_active')

admin.site.register(User, CustomUserAdmin)
@admin.register(Book)
class BookAdmin(admin.ModelAdmin):
        # Define the fields to display in the admin interface
    list_display = ('title', 'author', 'book_type', 'is_external', 'is_available', 'is_featured')
        # Define the fields to filter by in the admin interface
    list_filter = ('book_type', 'categories', 'is_available', 'is_featured')
        # Define the fields to search by in the admin interface
    search_fields = ('title', 'author', 'book_uuid')
    filter_horizontal = ('categories',)
        # Define the fields to display in the admin interface for each book
    fieldsets = (
        (None, {
            'fields': ('title', 'author', 'summary', 'description', 'publication_date', 'publisher')
        }),
        ('Classification', {
            'fields': ('categories', 'book_type',  'is_featured')
        }),
        ('Availability', {
            'fields': ('total_copies', 'available_copies', 'is_available')
        }),
        ('Media', {
            'fields': ('cover_image', 'pdf_file', 'external_source')
        }),
        ('Permissions', {
            'fields': ('download_permission',)
        }),
    )

    def is_external(self, obj):
        return bool(obj.external_source)
    is_external.boolean = True
admin.site.register(Category)

@admin.register(Video)
class VideoAdmin(admin.ModelAdmin):
    list_display = ('title', 'instructor', 'category', 'upload_date', 'is_featured', 'is_external')
    list_filter = ('category', 'is_featured')
    search_fields = ('title', 'description', 'instructor')
    readonly_fields = ('upload_date',)
    fieldsets = (
        (None, {
            'fields': ('title', 'instructor','description', 'category')
        }),
        ('Media', {
            'fields': ('video_file', 'thumbnail', 'duration', 'external_source')
        }),
        ('Settings', {
            'fields': ('is_featured',)
        })
    )

    def is_external(self, obj):
        return bool(obj.external_source)
    is_external.boolean = True

@admin.register(FeaturedBook)
class FeaturedBookAdmin(admin.ModelAdmin):
    list_display = ('id', 'created_at', 'expires_at', 'is_current')
    filter_horizontal = ('books',)
    readonly_fields = ('created_at',)
    
    def save_model(self, request, obj, form, change):
        if not obj.expires_at:
            obj.expires_at = timezone.now() + timezone.timedelta(hours=12)
        super().save_model(request, obj, form, change)
    
    def is_current(self, obj):
        return obj.expires_at > timezone.now()
    is_current.boolean = True