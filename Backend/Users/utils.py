import random
from django.utils import timezone

def  generate_otp():
    return str(random.randint(100000,999999))

def is_otp_expired(otp_created,minutes =5):
    if otp_created is None:
        return True
    return (timezone.now() -otp_created).seconds > minutes *60
