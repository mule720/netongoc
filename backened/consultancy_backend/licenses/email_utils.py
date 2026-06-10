from django.core.mail import send_mail
from django.conf import settings


def send_license_email(license):
    subject = f"Your Neton Payroll License Key — {license.company_name}"
    body = f"""Hello {license.contact_name},

Thank you for purchasing Neton Payroll!

Your license details:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Company   : {license.company_name}
  Machine ID: {license.machine_id}
  License Key: {license.license_key}
  Valid until: {license.expires_at.strftime('%B %Y')}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

How to activate:
1. Open Neton Payroll on your computer.
2. In the Activation dialog, click the "Activate" tab.
3. Paste your license key above and click Activate.

This key is locked to your machine (ID: {license.machine_id}).
It cannot be transferred to another computer.

Need help? Email us at chileshe720@gmail.com or visit www.netongoc.com.

— The Neton Team
"""
    send_mail(
        subject=subject,
        message=body,
        from_email=getattr(settings, 'DEFAULT_FROM_EMAIL', 'noreply@netongoc.com'),
        recipient_list=[license.email],
        fail_silently=False,
    )
