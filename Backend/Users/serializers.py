from rest_framework import serializers
from .models import CustomUser
from django.contrib.auth import authenticate,get_user_model
from rest_framework.exceptions import AuthenticationFailed

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
        fields=['id','name','email','role','phone_number', 'profile_picture']

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