from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import authenticate, login
from .serializers import UserSerializer
from library.models import User  

class SignupView(APIView):
    def post(self, request):
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class LoginView(APIView):
    def post(self, request):
        # email = request.data.get('email')
        username = request.data.get('username')
        password = request.data.get('password')
        user = authenticate(request, username=username, password=password)  # Key fix: use `username=email`
        if user:
            login(request, user)
            refresh = RefreshToken.for_user(user)
            return Response({"token": str(refresh.access_token), "role": user.role})
        return Response({"error": "Invalid credentials"}, status=401)
    

# {
#   "username": "admin",
#   "password": "admin123"
# }