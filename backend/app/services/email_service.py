"""
Email OTP Service for Darshan Journey
Handles OTP generation, storage (with TTL), rate limiting, and email dispatch via SMTP.
"""

import time
import secrets
import smtplib
import logging
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from collections import defaultdict
from app.config import settings

logger = logging.getLogger("darshan.email")

# ─── In-Memory OTP Store ───
# Structure: { "email": { "otp": str, "created_at": float, "attempts": int } }
_otp_store = {}

# ─── Rate Limiting Store ───
# Structure: { "email": [ timestamp1, timestamp2, ... ] }
_rate_limit_store = defaultdict(list)

# Constants
OTP_EXPIRY_SECONDS = 300  # 5 minutes
OTP_LENGTH = 6
MAX_OTP_REQUESTS_PER_WINDOW = 5
RATE_LIMIT_WINDOW_SECONDS = 600  # 10 minutes
MAX_VERIFY_ATTEMPTS = 5


def generate_otp() -> str:
    """Generate a cryptographically secure 6-digit OTP."""
    return "".join([str(secrets.randbelow(10)) for _ in range(OTP_LENGTH)])


def _cleanup_rate_limits(email: str):
    """Remove expired rate limit entries."""
    now = time.time()
    _rate_limit_store[email] = [
        ts for ts in _rate_limit_store[email]
        if now - ts < RATE_LIMIT_WINDOW_SECONDS
    ]


def check_rate_limit(email: str) -> bool:
    """Returns True if the email is within rate limits (allowed to request OTP)."""
    _cleanup_rate_limits(email)
    return len(_rate_limit_store[email]) < MAX_OTP_REQUESTS_PER_WINDOW


def record_otp_request(email: str):
    """Record an OTP request for rate limiting."""
    _rate_limit_store[email].append(time.time())


def store_otp(email: str, otp: str):
    """Store OTP with creation timestamp."""
    _otp_store[email.lower()] = {
        "otp": otp,
        "created_at": time.time(),
        "attempts": 0
    }


def verify_otp(email: str, otp: str) -> dict:
    """
    Verify the OTP for a given email.
    Returns: { "valid": bool, "error": str | None }
    """
    email_lower = email.lower()
    entry = _otp_store.get(email_lower)

    if not entry:
        return {"valid": False, "error": "No verification code found. Please request a new code."}

    # Check expiry
    elapsed = time.time() - entry["created_at"]
    if elapsed > OTP_EXPIRY_SECONDS:
        del _otp_store[email_lower]
        return {"valid": False, "error": "Verification code has expired. Please request a new code."}

    # Check max attempts
    if entry["attempts"] >= MAX_VERIFY_ATTEMPTS:
        del _otp_store[email_lower]
        return {"valid": False, "error": "Too many incorrect attempts. Please request a new code."}

    # Increment attempts
    entry["attempts"] += 1

    # Verify
    if entry["otp"] != otp.strip():
        remaining = MAX_VERIFY_ATTEMPTS - entry["attempts"]
        return {"valid": False, "error": f"Invalid verification code. {remaining} attempt(s) remaining."}

    # Success — remove from store
    del _otp_store[email_lower]
    return {"valid": True, "error": None}


def send_otp_email(to_email: str, otp: str, user_name: str = "Devotee") -> dict:
    """
    Send OTP via Gmail SMTP. Falls back gracefully if SMTP is not configured.
    Returns: { "success": bool, "method": str, "error": str | None }
    """
    smtp_email = settings.SMTP_EMAIL
    smtp_password = settings.SMTP_PASSWORD

    if not smtp_email or not smtp_password:
        missing_var = "SMTP_EMAIL and SMTP_PASSWORD" if (not smtp_email and not smtp_password) else ("SMTP_EMAIL" if not smtp_email else "SMTP_PASSWORD")
        err_msg = f"Email service not configured: {missing_var} missing in .env. Please configure your Gmail address and 16-character App Password in .env to send real verification codes."
        logger.warning(f"[Email Service] {err_msg}")
        return {
            "success": False,
            "method": "smtp",
            "error": err_msg
        }

    try:
        msg = MIMEMultipart("alternative")
        msg["From"] = f"Darshan Journey <{smtp_email}>"
        msg["To"] = to_email
        msg["Subject"] = f"Darshan Journey — Verification Code: {otp}"

        # Plain text version
        text_body = f"""Hello {user_name},

Your 6-digit verification code for Darshan Journey is:

    {otp}

This code will expire in 5 minutes. Do not share this code with anyone.

If you did not request this code, please ignore this email.

Blessings,
Darshan Journey Team
"""

        # HTML version
        html_body = f"""
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;font-family:'Segoe UI',Roboto,Arial,sans-serif;background:#FDF8F0;">
  <div style="max-width:480px;margin:32px auto;background:#FFFFFF;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(52,31,29,0.12);">
    <div style="background:linear-gradient(135deg,#341F1D,#4A2C28);padding:32px 24px;text-align:center;">
      <h1 style="color:#D4AF37;font-size:24px;margin:0 0 4px 0;font-family:Georgia,serif;">Darshan Journey</h1>
      <p style="color:rgba(247,239,230,0.7);font-size:14px;margin:0;">Sacred Temple Pilgrimage Platform</p>
    </div>
    <div style="padding:32px 24px;">
      <p style="color:#341F1D;font-size:16px;margin:0 0 8px 0;">Hello <strong>{user_name}</strong>,</p>
      <p style="color:#6E5351;font-size:14px;line-height:1.6;margin:0 0 24px 0;">
        Enter the verification code below to sign in to your Darshan Journey account:
      </p>
      <div style="background:linear-gradient(135deg,rgba(212,175,55,0.1),rgba(200,169,106,0.08));border:2px solid rgba(212,175,55,0.3);border-radius:12px;padding:20px;text-align:center;margin:0 0 24px 0;">
        <div style="font-size:36px;font-weight:700;letter-spacing:8px;color:#341F1D;font-family:'Courier New',monospace;">{otp}</div>
      </div>
      <p style="color:#9E8483;font-size:13px;line-height:1.5;margin:0 0 8px 0;">
        ⏳ This code expires in <strong>5 minutes</strong>.
      </p>
      <p style="color:#9E8483;font-size:13px;line-height:1.5;margin:0;">
        If you did not request this code, you can safely ignore this email.
      </p>
    </div>
    <div style="background:#FDF8F0;padding:16px 24px;text-align:center;border-top:1px solid rgba(200,169,106,0.2);">
      <p style="color:#9E8483;font-size:12px;margin:0;">© 2026 Darshan Journey — Sacred Temple Experiences</p>
    </div>
  </div>
</body>
</html>
"""

        msg.attach(MIMEText(text_body, "plain"))
        msg.attach(MIMEText(html_body, "html"))

        with smtplib.SMTP_SSL("smtp.gmail.com", 465, timeout=10) as server:
            server.login(smtp_email, smtp_password)
            server.sendmail(smtp_email, to_email, msg.as_string())

        logger.info(f"OTP email sent successfully to {to_email}")
        return {"success": True, "method": "smtp", "error": None}

    except smtplib.SMTPAuthenticationError:
        logger.error("SMTP authentication failed. Check SMTP_EMAIL and SMTP_PASSWORD in .env")
        return {"success": False, "method": "smtp", "error": "Email service authentication failed. Please contact support."}
    except Exception as e:
        logger.error(f"Failed to send OTP email: {e}")
        return {"success": False, "method": "smtp", "error": f"Failed to send email: {str(e)}"}
