# backend/authentication/urls.py
from django.urls import path
from .views import AdminProfileView, PasswordResetConfirmView, PasswordResetRequestView, SignupView, LoginView, UserProfileView, ChangePasswordView

urlpatterns = [
    path('signup/', SignupView.as_view(), name='signup'),
    path('login/', LoginView.as_view(), name='login'),
    path('profile/',UserProfileView.as_view(), name='user-profile'),
    path('change-password/', ChangePasswordView.as_view(), name='change-password'),
    path('admin/profile/', AdminProfileView.as_view(), name='admin-profile'),
    path('password-reset/', PasswordResetRequestView.as_view(), name='password-reset'),
    path('password-reset-confirm/<uidb64>/<token>/', 
         PasswordResetConfirmView.as_view(), name='password-reset-confirm'),
]