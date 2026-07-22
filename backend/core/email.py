"""Resend email helper."""
import logging
import resend
from core.config import settings

resend.api_key = settings.RESEND_API_KEY
logger = logging.getLogger(__name__)


def send_otp_email(to_email: str, otp: str, purpose: str) -> None:
    if purpose == "reset":
        from_address = "noreply@setupspot.tech"
        action = "reset your password"
    elif purpose == "signup":
        from_address = "noreply@setupspot.tech"
        action = "verify your email"
    else:
        from_address = "noreply@setupspot.tech"
        action = "confirm your password change"

    logger.info(f"[EMAIL] Triggering OTP email | to={to_email} purpose={purpose}")
    try:
        r = resend.Emails.send({
            "from": from_address,
            "to": to_email,
            "subject": "Your SetupSpot verification code",
            "html": f"""
                <p>Your SetupSpot verification code to {action}:</p>
                <h2 style="letter-spacing: 8px; font-size: 32px;">{otp}</h2>
                <p>This code expires in 15 minutes. If you didn't request this, ignore this email.</p>
            """,
        })
        logger.info(f"[EMAIL] Sent successfully | id={r.get('id')} to={to_email}")
    except Exception as e:
        logger.error(f"[EMAIL] Failed to send | to={to_email} error={e}")
        raise
