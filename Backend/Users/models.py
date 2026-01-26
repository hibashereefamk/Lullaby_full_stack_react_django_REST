from django.db import models
from django.contrib.auth.models import AbstractUser,User
from django.db.models.signals import post_save
from django.dispatch import receiver


class CustomUser(AbstractUser):
    ROLE_CHOICES =(
        ('admin', 'Admin'),
        ('customer', 'Customer'),
    )
    name=models.CharField(max_length=100)
    role =models.CharField(max_length=20,choices=ROLE_CHOICES,default='customer')
    is_active=models.BooleanField(default=True)
    email =models.EmailField(unique=True)
    is_staff=models.BooleanField(default=False)
    phone_number=models.CharField(max_length=15,blank=True,null=True)
    profile_picture=models.ImageField(upload_to='profile_pics/',blank=True,null=True)
    otp=models.CharField(max_length=6,blank=True,null=True)
    otp_created=models.DateTimeField(blank=True,null=True)
    is_email_verification=models.BooleanField(default=False)
    bio = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    

    def __str__(self):
        return f'{self.username} ({self.role})'
    
    

