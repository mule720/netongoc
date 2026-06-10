"""
License key generation — must stay in sync with PayrolPro/app/services/license_service.py.

Algorithm:
  key_data = machine_id.upper() + "|" + expiry_yyyymm
  raw      = HMAC-SHA256(_SECRET, key_data)[:20].upper()
  key      = raw formatted as XXXX-XXXX-XXXX-XXXX-XXXX
"""
import hashlib
import hmac
from datetime import date

# Must match the secret in the desktop app's license_service.py
_SECRET = b"N3t0nP@yr0ll#2025!Z@mb1a$3cur3K3y"


def _expiry_yyyymm(months: int) -> tuple[str, date]:
    today = date.today()
    m = today.month + months
    y = today.year + (m - 1) // 12
    m = ((m - 1) % 12) + 1
    return f"{y:04d}{m:02d}", date(y, m, 1)


def generate_license_key(machine_id: str, months: int = 12) -> tuple[str, date]:
    """Return (license_key, expiry_date)."""
    expiry_str, expiry_date = _expiry_yyyymm(months)
    key_data = f"{machine_id.upper()}|{expiry_str}".encode()
    raw = hmac.new(_SECRET, key_data, hashlib.sha256).hexdigest()[:20].upper()
    key = f"{raw[0:4]}-{raw[4:8]}-{raw[8:12]}-{raw[12:16]}-{raw[16:20]}"
    return key, expiry_date
