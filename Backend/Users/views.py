from django.shortcuts import render
from django.core.mail import send_mail
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from .models import CustomUser
from django.utils import timezone
from .utils import generate_otp,is_otp_expired
from .models import CustomUser
from .serializers import RegisterSerializer, LoginSerializer,UserProfileSerializer
from rest_framework_simplejwt.tokens import RefreshToken
from django.conf import settings
from rest_framework import permissions
from rest_framework import generics
from django.utils.decorators import method_decorator
from django.views.decorators.cache import never_cache

@method_decorator(never_cache, name='dispatch')
class sendOTPView(APIView):
    def post(self, request):
        email = request.data.get('email')
        
        if not email:
            return Response({'error':"Email isrequired"},status=status.HTTP_400_BAD_REQUEST) 
        user, created = CustomUser.objects.get_or_create(
        email=email,
        defaults={"usrname":email.slip('@')[0]}
)
        
        
        otp = generate_otp()
        user.otp = otp
        user.otp_created = timezone.now()
        user.save()

        try:
            send_mail(
                subject="Your OTP Code",
                message=f"Your OTP code is: {otp}",
                from_email=settings.EMAIL_HOST_USER,
                recipient_list=[email],
                fail_silently=False
            )
        except Exception as e:
            return Response({'error':"failed to email.Please try again later."},status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        return Response({"message": "OTP sent successfully"}, status=status.HTTP_200_OK)
    

@method_decorator(never_cache, name='dispatch')
class VerifyOTPView(APIView):
    def post(self,request):
         email=request.data.get('email')
         otp=request.data.get('otp')
         try:
              user=CustomUser.objects.get(email=email,otp=otp)
              if is_otp_expired(user.otp_created):
                   return Response({"message": "OTP has expired"}, status=status.HTTP_400_BAD_REQUEST)
              user.is_email_verification = True
              user.otp = None
              user.otp_created = None
              user.save()
              return Response({"message": "OTP verified successfully"}, status=status.HTTP_200_OK)
         except CustomUser.DoesNotExist:
              return Response({"message": "Invalid OTP"}, status=status.HTTP_400_BAD_REQUEST)
         
         
@method_decorator(never_cache, name='dispatch')
class RegisterView(APIView):
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)

        if serializer.is_valid():
            user = serializer.save()

            otp = generate_otp()
            user.otp = otp
            user.otp_created = timezone.now()
            user.save()

            send_mail(
                subject="Your OTP Code",
                message=f"Your OTP is {otp}",
                from_email="hibashareefamk@gmail.com",
                recipient_list=[user.email],
            )

            return Response(
                {"message": "Registered successfully. OTP sent to email."},
                status=status.HTTP_201_CREATED
            )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@method_decorator(never_cache, name='dispatch')
class LoginView(APIView):
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = serializer.validated_data['user']
        refresh = RefreshToken.for_user(user)

        return Response({
            "refresh": str(refresh),
            "access": str(refresh.access_token),
            "role": user.role,
            "email": user.email,
            "name": user.name,
        })
    
@method_decorator(never_cache, name='dispatch')    
class LogoutView(APIView):
    permission_classes =[IsAuthenticated]

    def post(self,request):
        try:
            refresh_token = request.data["refresh_token"]
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response({"message": "Successfully logged out"}, status=status.HTTP_205_RESET_CONTENT)
        except Exception as e:
            return Response({"error": "Invalid token"}, status=status.HTTP_400_BAD_REQUEST)

@method_decorator(never_cache, name='dispatch')
class UserProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        
        return self.request.user