from django.db import models
from django.contrib.auth.models import AbstractUser


class CustomUser(AbstractUser):
    ROLE_CHOICES =(
        ('admin', 'Admin'),
        ('customer', 'Customer'),
        ('vendor','vendor'),
    )
    name=models.CharField(max_length=100)
    role =models.CharField(max_length=20,choices=ROLE_CHOICES,default='customer')
    email =models.EmailField(unique=True)
    phone_number=models.CharField(max_length=15,blank=True,null=True)
    profile_picture=models.ImageField(upload_to='profile_pics/',blank=True,null=True)
    otp=models.CharField(max_length=6,blank=True,null=True)
    otp_created=models.DateTimeField(blank=True,null=True)
    is_email_verification=models.BooleanField(default=False)
    

    def __str__(self):
        return f'{self.username} ({self.role})'

