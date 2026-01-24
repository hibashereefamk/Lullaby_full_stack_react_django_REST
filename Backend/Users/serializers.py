from rest_framework import serializers
from .models import CustomUser
from django.contrib.auth import authenticate,get_user_model
from rest_framework.exceptions import AuthenticationFailed
from rest_framework.permissions import BasePermission
from rest_framework import serializers
from django.contrib.auth.tokens import PasswordResetTokenGenerator
from django.utils.encoding import force_str
from django.utils.http import urlsafe_base64_decode
from .models import CustomUser
from rest_framework.pagination import PageNumberPagination



user = get_user_model()

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = CustomUser
        fields = ['name','email','phone_number',  'password',]

    def create(self, validated_data):
        user = CustomUser.objects.create_user(
            email=validated_data['email'],
            username=validated_data['email'],
            password=validated_data['password'],
            name=validated_data.get('name'),
            phone_number=validated_data.get('phone_number'),
        )
        return user
    
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model=CustomUser
        fields=['id','name','email','role','phone_number', 'profile_picture', 'created_at']
        read_only_fields = ['email', 'first_name', 'last_name', 'phone', 'created_at']

class LoginSerializer(serializers.Serializer):
    email =serializers.EmailField()
    password=serializers.CharField(write_only=True)

    def validate(self, data):
        email=data.get('email')
        password=data.get('password')
        user=authenticate( username=email, password=password)
        if not user:
            raise AuthenticationFailed('invalid email or password')
        if not user.is_active:
            raise AuthenticationFailed('user is Deactivated')
        
        return{
            'user':user
        }
    
class UserProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField( read_only=True)
    email = serializers.CharField( read_only=True)
    date_joined = serializers.DateTimeField( read_only=True)

    class Meta:
        model = CustomUser
        fields = ['id', 'username','name', 'email','profile_picture', 'phone_number','bio',  'date_joined']

class ResetPasswordRequestSerializer(serializers.Serializer):
    email =serializers.EmailField(min_length = 2)

    class Meta:
        fields =['email']
    def validate(self, attrs):
        email = attrs['email']
        if not CustomUser.objects.filter(email=email).exists():
            raise serializers.ValidationError('User with this email does not exist')
        return attrs
    
class SetNewPasswordSerializer(serializers.Serializer):
    password = serializers.CharField(min_length=8, write_only=True)
    token = serializers.CharField(write_only=True)
    uidb64 = serializers.CharField(write_only=True)

    class Meta:
        fields = ['password', 'token', 'uidb64']

    def validate(self, attrs):
        try:
            password = attrs.get('password')
            token = attrs.get('token')
            uidb64 = attrs.get('uidb64')

           
            id = force_str(urlsafe_base64_decode(uidb64))
            user = CustomUser.objects.get(id=id)

        
            if not PasswordResetTokenGenerator().check_token(user, token):
                raise serializers.ValidationError('The reset link is invalid or expired', 401)

            user.set_password(password)
            user.save()
            return user
        except Exception as e:
            raise serializers.ValidationError('The reset link is invalid', 401)