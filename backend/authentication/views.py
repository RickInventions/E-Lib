# backend/authentication/views.py
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.generics import RetrieveUpdateAPIView
from rest_framework import status
from django.contrib.auth import authenticate, login
from .serializers import UserSerializer
from django.contrib.auth.tokens import PasswordResetTokenGenerator
from django.utils.encoding import force_str
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes
from django.core.mail import send_mail
from django.conf import settings
from django.contrib.auth import get_user_model

User = get_user_model()

class SignupView(APIView):
    """
    Handles user registration.
    - Accepts user data, validates, and creates a new user.
    - Returns created user data or validation errors.
    - Edge case: Handles invalid data with appropriate error response.
    """
    def post(self, request):
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class LoginView(APIView):
    """
    Handles user login.
    - Authenticates user with email and password.
    - Returns JWT token and user role on success.
    - Edge case: Returns error for invalid credentials.
    """
    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')
        user = authenticate(request, username=email, password=password)  
        if user:
            login(request, user)
            refresh = RefreshToken.for_user(user)
            return Response({"token": str(refresh.access_token), "role": user.role})
        return Response({"error": "Invalid credentials"}, status=401)
    

class UserProfileView(RetrieveUpdateAPIView):
    """
    Allows authenticated users to retrieve and update their profile.
    - Uses UserSerializer for serialization.
    - Only allows access to the logged-in user's own data.
    """
    permission_classes = [IsAuthenticated]
    serializer_class = UserSerializer

    def get_object(self):
        return self.request.user

class ChangePasswordView(APIView):
    """
    Allows authenticated users to change their password.
    - Checks if old password matches before updating.
    - Edge case: Returns error if old password is incorrect.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        old_password = request.data.get('old_password')
        new_password = request.data.get('new_password')

        if not user.check_password(old_password):
            return Response({"error": "Wrong password"}, status=400)
        
        user.set_password(new_password)
        user.save()
        return Response({"message": "Password updated"})
    
class AdminProfileView(APIView):
    """
    Allows admin users to view and update their profile.
    - GET: Returns admin's profile data.
    - PUT: Updates admin's profile with provided data.
    - Edge case: Only accessible by admin users.
    """
    permission_classes = [IsAdminUser]
    
    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)
    
    def put(self, request):
        user = request.user
        serializer = UserSerializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)
    

class PasswordResetRequestView(APIView):
    """
    Handles password reset requests.
    - Generates a reset token and sends a reset link to the user's email.
    - Edge case: Returns error if user with given email does not exist.
    """
    def post(self, request):
        email = request.data.get('email')
        try:
            user = User.objects.get(email=email)
            token = PasswordResetTokenGenerator().make_token(user)
            uid = urlsafe_base64_encode(force_bytes(user.pk))
            
            reset_link = f"{settings.FRONTEND_URL}/reset-password/{uid}/{token}/"
            
            send_mail(
                'Password Reset Request',
                f'Click here to reset your password: {reset_link}',
                settings.DEFAULT_FROM_EMAIL,
                [user.email],
                fail_silently=False,
            )
            return Response({'message': 'Password reset email sent'})
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=404)

class PasswordResetConfirmView(APIView):
    """
    Handles password reset confirmation.
    - Validates token and uid, sets new password.
    - Edge cases: Handles invalid token, invalid uid, and user not found.
    """
    def post(self, request, uidb64, token):
        try:
            uid = force_str(urlsafe_base64_decode(uidb64))
            user = User.objects.get(pk=uid)
            
            if not PasswordResetTokenGenerator().check_token(user, token):
                return Response({'error': 'Invalid token'}, status=400)
                
            new_password = request.data.get('new_password')
            user.set_password(new_password)
            user.save()
            return Response({'message': 'Password reset successful'})
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            return Response({'error': 'Invalid request'}, status=400)