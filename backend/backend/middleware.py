# Import necessary modules
from django.http import JsonResponse
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError

# Define a middleware class for JWT authentication
class JWTAuthenticationMiddleware:
    """
    This middleware class handles JWT authentication for incoming requests.
    It checks if the request path is exempt from authentication (e.g. login and signup)
    and if not, it calls the next middleware in the chain.
    """
    def __init__(self, get_response):
        """
        Initialize the middleware instance with the next middleware in the chain.
        This is called once when the middleware is instantiated.
        """
        self.get_response = get_response

    def __call__(self, request):
        """
        This is the main entry point for the middleware.
        It checks if the request path is exempt from authentication and if not,
        it calls the next middleware in the chain.
        """
        # Check if the request path is exempt from authentication
        if request.path in ['/api/auth/login/', '/api/auth/signup/']:
            # If exempt, return the response from the next middleware
            return self.get_response(request)
        # If not exempt, call the next middleware in the chain
        response = self.get_response(request)
        return response