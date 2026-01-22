import random
from django.utils import timezone
from django.core.mail import EmailMessage

def  generate_otp():
    return str(random.randint(100000,999999))

def is_otp_expired(otp_created,minutes =5):
    if otp_created is None:
        return True
    return (timezone.now() -otp_created).seconds > minutes *60

class Util:
    @staticmethod
    def send_email(data):
        email = EmailMessage(
            subject=data['email_subject'],
            body=data['email_body'],
            to=[data['to_email']]
        )
        email.send()