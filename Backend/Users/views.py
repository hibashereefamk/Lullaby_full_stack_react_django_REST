from django.shortcuts import render
from django.core.mail import send_mail
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from product.permission import IsActiveUser
from django.utils import timezone
from .utils import generate_otp,is_otp_expired
from .models import CustomUser
from .serializers import( RegisterSerializer, LoginSerializer,UserProfileSerializer,ResetPasswordRequestSerializer,
                         SetNewPasswordSerializer,AdminUserStatuserializer)
from rest_framework_simplejwt.tokens import RefreshToken
from django.conf import settings
from rest_framework import generics
from django.utils.decorators import method_decorator
from django.views.decorators.cache import never_cache
from .utils import Util
from django.contrib.auth.tokens import PasswordResetTokenGenerator
from django.utils.encoding import smart_bytes
from django.utils.http import urlsafe_base64_encode
from google.oauth2 import id_token
from google.auth.transport import requests
from rest_framework.permissions import IsAdminUser,IsAuthenticated
from django.shortcuts import get_object_or_404

class GoogleLoginView(APIView):
    def post(self, request):
        token = request.data.get('token')
        
        if not token:
            return Response({'error': 'Token is required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # 1. Verify the token with Google
            # Replace CLIENT_ID with your actual Client ID from Google Cloud
            idinfo = id_token.verify_oauth2_token(token, requests.Request(), "515795235834-u4s88flf4tmfokjn6kfrhrejncl8jjcc.apps.googleusercontent.com",clock_skew_in_seconds=10)

            # 2. Get user info from the verified token
            email = idinfo['email']
            first_name = idinfo.get('given_name', '')
            last_name = idinfo.get('family_name', '')

            # 3. Check if user exists, otherwise create them
            user, created = CustomUser.objects.get_or_create(username=email, defaults={
                'email': email,
                'first_name': first_name,
                'last_name': last_name,
                
            })
            
            # If creating a new user, you might want to set an unusable password
            if created:
                user.set_unusable_password()
                user.save()

            # 4. Create a Django Token (JWT approach shown here)
            refresh = RefreshToken.for_user(user)
            
            return Response({
                'refresh': str(refresh),
                'access': str(refresh.access_token),
                'role': user.role,       # <--- Added this (React needs it)
                'email': user.email,
                'name': user.name,
            })

        except ValueError:
            # Invalid token
            return Response({'error': 'Invalid Google Token'}, status=status.HTTP_400_BAD_REQUEST)



@method_decorator(never_cache, name='dispatch')
class sendOTPView(APIView):
    def post(self, request):
        email = request.data.get('email')
        
        if not email:
            return Response({'error':"Email isrequired"},status=status.HTTP_400_BAD_REQUEST) 
        user, created = CustomUser.objects.get_or_create(
            email=email,
            defaults={"username": email.split('@')[0]} 
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
            "name": user.first_name,
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
class UserProfileView(APIView):
    permission_classes = [IsActiveUser]
    def get(self, request):
        user = request.user
        serializer = UserProfileSerializer(user)
        return Response(serializer.data, status=status.HTTP_200_OK)
    def put(self, request):
        user = request.user
        serializer = UserProfileSerializer(user, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    def patch(self, request):
        user = request.user
        serializer = UserProfileSerializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    

class RequestPasswordResetEmail(generics.GenericAPIView):
    serializer_class = ResetPasswordRequestSerializer

    def post(self, request):
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)

        email = request.data['email'].strip()
        user = CustomUser.objects.get(email=email)


        uidb64 = urlsafe_base64_encode(smart_bytes(user.id))
        token = PasswordResetTokenGenerator().make_token(user)
        frontend_url = 'http://localhost:5173'
        abs_url = f"{frontend_url}/reset-password/{uidb64}/{token}"

        email_body = f'Hello, \n Click the link below to reset your password: \n {abs_url}'
        
        data = {
            'email_body': email_body,
            'to_email': user.email,
            'email_subject': 'Reset your Password'
        }
        
        Util.send_email(data)

        return Response({'success': 'Link sent to your email'}, status=status.HTTP_200_OK)

class SetNewPasswordAPIView(generics.GenericAPIView):
    serializer_class = SetNewPasswordSerializer

    def patch(self, request):
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)
        return Response({'success': True, 'message': 'Password reset success'}, status=status.HTTP_200_OK)
    
class AdminUserManagementView(APIView):
    permission_classes =[IsAdminUser]
    def get(self,request):
        user_id =request.query_params.get('user_id')
        if user_id:
            user =get_object_or_404(CustomUser,id=user_id)
            serializer =AdminUserStatuserializer(user)
        else:
            users =CustomUser.objects.all().order_by('-id')
            serializer=AdminUserStatuserializer(users,many=True)
        return Response(serializer.data)

    def path(self,request):
        user_id =request.query_params.get('user_id')
        user =get_object_or_404(CustomUser,id=user_id)
        serializer =AdminUserStatuserializer(user,data=request.data,partial=True)
        if serializer.is_valid():
            serializer.save()
            status_text ='Active' if user.is_active else 'Blocked'
            return Response({'message':f"User is now {status_text}",'data':serializer.data})
        return Response(serializer.errors,status=status.HTTP_400_BAD_REQUEST)