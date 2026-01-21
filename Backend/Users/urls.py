from django.urls import path
from .views import RegisterView, VerifyOTPView, LoginView,sendOTPView,UserProfileView,LogoutView

urlpatterns = [
    path('api/register/', RegisterView.as_view()),
    path('api/verify-otp/', VerifyOTPView.as_view()),
    path('api/login/', LoginView.as_view()),
    path('api/send-otp/', sendOTPView.as_view()),
    path('api/profile/', UserProfileView.as_view(), name='user-profile'),
    path('api/logout/', LogoutView.as_view(), name='logout'),
]
