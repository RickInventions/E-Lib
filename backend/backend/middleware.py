# backend/backend/middleware.py
from django.http import JsonResponse
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError

class JWTAuthenticationMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Skip middleware for these paths
        if request.path in ['/api/auth/login/', '/api/auth/signup/']:
            return self.get_response(request)
            
        response = self.get_response(request)
        return response