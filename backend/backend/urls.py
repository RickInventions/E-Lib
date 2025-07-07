# Import necessary modules
from django.contrib import admin
from django.conf import settings
from django.urls import path, include
from django.conf.urls.static import static
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView

# Define the URL patterns for the project
urlpatterns = [
    # URL pattern for the admin interface
    path('admin/', admin.site.urls),
        # Authentication API
    path('api/auth/', include('authentication.urls')),
        # Library API
    path('api/', include('library.urls')),
        # Inquiries API
    path('api/', include('inquiries.urls')),
        # API schema
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
        # API documentation
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
"""
This code serves static files in development mode.
It maps the MEDIA_URL to the MEDIA_ROOT directory.
"""