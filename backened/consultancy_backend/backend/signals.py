from django.db.models.signals import post_save
from django.dispatch import receiver
from django.conf import settings
from .models import ContactRequest
import os


def send_sms_via_twilio(to_number: str, message: str) -> bool:
    """Send an SMS using Twilio REST API. Returns True on success."""
    try:
        from twilio.rest import Client
    except Exception:
        # Twilio not installed
        return False

    account_sid = os.environ.get('TWILIO_ACCOUNT_SID')
    auth_token = os.environ.get('TWILIO_AUTH_TOKEN')
    from_number = os.environ.get('TWILIO_FROM_NUMBER')

    if not (account_sid and auth_token and from_number):
        return False

    client = Client(account_sid, auth_token)
    try:
        client.messages.create(body=message, from_=from_number, to=to_number)
        return True
    except Exception:
        return False


@receiver(post_save, sender=ContactRequest)
def contact_request_created(sender, instance: ContactRequest, created, **kwargs):
    if not created:
        return

    # Build message
    msg = f"New contact request from {instance.name} ({instance.email}): {instance.message[:200]}"

    # Send to company number specified in env
    company_number = os.environ.get('COMPANY_PHONE_NUMBER')
    if company_number:
        send_sms_via_twilio(company_number, msg)
