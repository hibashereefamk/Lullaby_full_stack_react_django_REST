from django.urls import path
from .views import RegisterView, VerifyOTPView, LoginView,sendOTPView,UserProfileView,LogoutView,RequestPasswordResetEmail,SetNewPasswordAPIView,GoogleLoginView

urlpatterns = [
    path('api/register/', RegisterView.as_view()),
    path('api/verify-otp/', VerifyOTPView.as_view()),
    path('api/login/', LoginView.as_view()),
    path('api/send-otp/', sendOTPView.as_view()),
    path('api/profile/', UserProfileView.as_view(), name='user-profile'),
    path('api/logout/', LogoutView.as_view(), name='logout'),

    path('api/request-reset-email/', RequestPasswordResetEmail.as_view(), name="request-reset-email"),
    path('api/password-reset-complete/', SetNewPasswordAPIView.as_view(), name='password-reset-complete'),
    path('api/google-login/', GoogleLoginView.as_view(), name='google_login'),
    
]

