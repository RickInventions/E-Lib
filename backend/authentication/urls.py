from django.urls import path
from .views import AdminProfileView, PasswordResetConfirmView, PasswordResetRequestView, SignupView, LoginView, UserProfileView, ChangePasswordView

# URL patterns for authentication-related endpoints.
# Each path maps to a view handling a specific authentication or user management task.
urlpatterns = [
    path('signup/', SignupView.as_view(), name='signup'),  # User registration endpoint
    path('login/', LoginView.as_view(), name='login'),  # User login endpoint
    path('profile/',UserProfileView.as_view(), name='user-profile'), # User profile view/update
    path('change-password/', ChangePasswordView.as_view(), name='change-password'),  # Change password
    path('admin/profile/', AdminProfileView.as_view(), name='admin-profile'),  # Admin profile view/update
    path('password-reset/', PasswordResetRequestView.as_view(), name='password-reset'),  # Request password reset
    path('password-reset-confirm/<uidb64>/<token>/', 
         PasswordResetConfirmView.as_view(), name='password-reset-confirm'), # Confirm password reset
]
