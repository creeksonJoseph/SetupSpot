"""Feedback service layer with email notification dispatch."""
import logging
from sqlalchemy.orm import Session
from models.user import User
from models.feedback import Feedback
from transactions import feedback_repo


ADMIN_EMAIL = "charanajoseph@gmail.com"
logger = logging.getLogger("setupspot.feedback")


def send_feedback_email(user_email: str, username: str, message: str, category: str, feedback_id: int = None):
    """Dispatch real Resend email notification to charanajoseph@gmail.com."""
    import resend
    from core.config import settings

    logger.info(
        f"[FEEDBACK EMAIL DISPATCH TO {ADMIN_EMAIL}]\n"
        f"From: {username} ({user_email})\n"
        f"Category: {category}\n"
        f"Message:\n{message}\n"
        f"------------------------------------------------"
    )

    if settings.RESEND_API_KEY:
        try:
            resend.api_key = settings.RESEND_API_KEY
            initial_letter = username[0].upper() if username else "?"
            formatted_cat = category.replace('_', ' ').title()
            admin_reply_url = f"https://setupspot.tech/admin?tab=feedback&id={feedback_id}" if feedback_id else "https://setupspot.tech/admin?tab=feedback"

            is_bug = "bug" in category.lower()
            heading_title = "New Bug Report" if is_bug else "New User Feedback"

            resend.Emails.send({
                "from": "SetupSpot <admin@setupspot.tech>",
                "to": ADMIN_EMAIL,
                "subject": "New Message from SetupSpot",
                "html": f"""<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>{heading_title} - SetupSpot</title>
</head>
<body style="margin:0; padding:24px 12px; background-color:#F7F9FB; font-family:'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color:#0F172A; -webkit-font-smoothing:antialiased;">
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
    <tr>
      <td align="center">
        <div style="max-width: 600px; width: 100%; text-align: left;">
          
          <!-- Header -->
          <div style="margin-bottom: 24px; text-align: center;">
            <a href="https://setupspot.tech" style="text-decoration: none; display: inline-flex; align-items: center; gap: 8px;">
              <img src="https://setupspot.tech/Logo.png" alt="SetupSpot Logo" style="width: 38px; height: 38px; border-radius: 10px; object-fit: contain; vertical-align: middle;" />
              <span style="font-size: 22px; font-weight: 800; color: #0F172A; letter-spacing: -0.5px; vertical-align: middle; margin-left: 8px;">SetupSpot</span>
            </a>
          </div>

          <!-- Main Card -->
          <div style="background-color: #ffffff; border: 1px solid #E2E8F0; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(15, 23, 42, 0.05);">
            <!-- Top Blue Accent Line -->
            <div style="height: 4px; width: 100%; background: linear-gradient(90deg, #0066ff 0%, #0050cb 100%);"></div>

            <div style="padding: 24px;">
              <!-- Title & Category Badge -->
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 20px; border-bottom: 1px solid #E2E8F0; padding-bottom: 20px;">
                <tr>
                  <td style="vertical-align: top;">
                    <h2 style="font-size: 20px; font-weight: 700; color: #0F172A; margin: 0 0 4px 0;">{heading_title}</h2>
                    <p style="font-size: 13px; color: #64748B; margin: 0;">Sent directly from SetupSpot</p>
                  </td>
                  <td align="right" style="vertical-align: top;">
                    <span style="display: inline-block; padding: 4px 12px; border-radius: 20px; background-color: rgba(0,102,255,0.08); color: #0066ff; border: 1px solid rgba(0,102,255,0.2); font-size: 12px; font-weight: 700;">
                      {formatted_cat}
                    </span>
                  </td>
                </tr>
              </table>

              <!-- User Info Box -->
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 20px; background-color: #F8FAFC; padding: 12px 16px; border-radius: 12px; border: 1px solid #E2E8F0;">
                <tr>
                  <td width="40" style="vertical-align: middle;">
                    <div style="width: 36px; height: 36px; border-radius: 50%; background-color: #0066ff; color: #ffffff; font-weight: 700; font-size: 14px; text-align: center; line-height: 36px;">
                      {initial_letter}
                    </div>
                  </td>
                  <td style="vertical-align: middle; padding-left: 10px;">
                    <p style="font-size: 14px; font-weight: 700; color: #0F172A; margin: 0;">@{username}</p>
                    <p style="font-size: 13px; color: #64748B; margin: 2px 0 0 0;">{user_email}</p>
                  </td>
                </tr>
              </table>

              <!-- Message Content -->
              <div style="margin-bottom: 24px;">
                <h3 style="font-size: 11px; font-weight: 700; color: #64748B; text-transform: uppercase; letter-spacing: 0.8px; margin: 0 0 8px 0;">Message</h3>
                <div style="background-color: #F8FAFC; padding: 16px; border-radius: 12px; border: 1px solid #E2E8F0; color: #334155; font-size: 14px; line-height: 1.6; white-space: pre-wrap;">
                  "{message}"
                </div>
              </div>

              <!-- Action / Reply Footer -->
              <div style="padding-top: 20px; border-top: 1px solid #E2E8F0;">
                <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
                  <tr>
                    <td style="font-size: 13px; color: #64748B;">
                      User email: <strong style="color: #0F172A;">{user_email}</strong>
                    </td>
                    <td align="right">
                      <a href="{admin_reply_url}" style="display: inline-block; padding: 10px 20px; border-radius: 10px; background-color: #0066ff; color: #ffffff; font-weight: 700; font-size: 13px; text-decoration: none; box-shadow: 0 4px 12px rgba(0,102,255,0.25);">
                        Reply via Admin Portal &rarr;
                      </a>
                    </td>
                  </tr>
                </table>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div style="margin-top: 24px; text-align: center; font-size: 12px; color: #94A3B8;">
            <p style="margin: 0 0 8px 0;">&copy; 2026 SetupSpot. All rights reserved.</p>
            <p style="margin: 0;">
              <a href="https://setupspot.tech" style="color: #64748B; text-decoration: none;">SetupSpot.tech</a>
            </p>
          </div>

        </div>
      </td>
    </tr>
  </table>
</body>
</html>""",
            })
            logger.info(f"[FEEDBACK EMAIL SENT VIA RESEND TO {ADMIN_EMAIL}]")
        except Exception as err:
            logger.error(f"[FEEDBACK EMAIL FAILED TO SEND VIA RESEND] error={err}")



def format_feedback_out(item: Feedback, user: User) -> dict:
    return {
        "id": item.id,
        "user_id": item.user_id,
        "username": user.username,
        "user_email": user.email,
        "message": item.message,
        "category": item.category,
        "status": item.status,
        "created_at": item.created_at,
    }


def submit_feedback(db: Session, current_user: User, message: str, category: str = "feature_suggestion"):
    item = feedback_repo.create_feedback(
        db, user_id=current_user.id, message=message, category=category
    )
    send_feedback_email(
        user_email=current_user.email,
        username=current_user.username,
        message=message,
        category=category,
        feedback_id=item.id,
    )
    return format_feedback_out(item, current_user)


def list_feedback_for_admin(db: Session, current_user: User):
    from services.admin_service import is_admin_user
    if not is_admin_user(current_user):
        from fastapi import HTTPException
        raise HTTPException(status_code=403, detail="Admin access required")
    return feedback_repo.list_all_feedback(db)


def send_reply_email(user_email: str, username: str, reply_message: str) -> None:
    """Send reply email to user from productteam@setupspot.tech with non-replyable footer disclaimer."""
    import resend
    from core.config import settings

    if settings.RESEND_API_KEY:
        try:
            resend.api_key = settings.RESEND_API_KEY
            resend.Emails.send({
                "from": "SetupSpot Product Team <productteam@setupspot.tech>",
                "to": user_email,
                "subject": "Re: Your SetupSpot Feedback",
                "html": f"""<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>SetupSpot Product Team Response</title>
</head>
<body style="margin:0; padding:24px 12px; background-color:#F7F9FB; font-family:'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color:#0F172A; -webkit-font-smoothing:antialiased;">
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
    <tr>
      <td align="center">
        <div style="max-width: 600px; width: 100%; text-align: left;">
          
          <!-- Header -->
          <div style="margin-bottom: 24px; text-align: center;">
            <a href="https://setupspot.tech" style="text-decoration: none; display: inline-flex; align-items: center; gap: 8px;">
              <img src="https://setupspot.tech/Logo.png" alt="SetupSpot Logo" style="width: 38px; height: 38px; border-radius: 10px; object-fit: contain; vertical-align: middle;" />
              <span style="font-size: 22px; font-weight: 800; color: #0F172A; letter-spacing: -0.5px; vertical-align: middle; margin-left: 8px;">SetupSpot</span>
            </a>
          </div>

          <!-- Main Card -->
          <div style="background-color: #ffffff; border: 1px solid #E2E8F0; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(15, 23, 42, 0.05);">
            <!-- Top Blue Accent Line -->
            <div style="height: 4px; width: 100%; background: linear-gradient(90deg, #0066ff 0%, #0050cb 100%);"></div>

            <div style="padding: 24px;">
              <p style="font-size: 15px; font-weight: 700; color: #0F172A; margin: 0 0 12px 0;">Hi @{username},</p>
              
              <p style="font-size: 13px; color: #64748B; margin: 0 0 16px 0;">The SetupSpot Product Team responded to your feedback:</p>

              <!-- Reply Message Content -->
              <div style="background-color: #F8FAFC; border: 1px solid #E2E8F0; padding: 18px; border-radius: 12px; font-size: 14px; line-height: 1.6; color: #1E293B; margin-bottom: 24px; white-space: pre-wrap;">
                {reply_message}
              </div>

              <!-- Disclaimer -->
              <p style="font-size: 12px; color: #64748B; margin: 0; padding-top: 16px; border-top: 1px solid #E2E8F0; line-height: 1.5;">
                <em>Please note: You cannot reply directly to this automated email. If you need to speak to live support, please visit <a href="https://setupspot.tech" style="color: #0066ff; font-weight: 700; text-decoration: none;">SetupSpot.tech</a>.</em>
              </p>
            </div>
          </div>

          <!-- Footer -->
          <div style="margin-top: 24px; text-align: center; font-size: 12px; color: #94A3B8;">
            <p style="margin: 0 0 8px 0;">&copy; 2026 SetupSpot. All rights reserved.</p>
            <p style="margin: 0;">
              <a href="https://setupspot.tech" style="color: #64748B; text-decoration: none;">SetupSpot.tech</a>
            </p>
          </div>

        </div>
      </td>
    </tr>
  </table>
</body>
</html>""",
            })
            logger.info(f"[REPLY EMAIL SENT VIA RESEND TO {user_email}]")
        except Exception as err:
            logger.error(f"[REPLY EMAIL FAILED TO SEND VIA RESEND] error={err}")


def reply_to_feedback(db: Session, current_user: User, feedback_id: int, reply_message: str) -> dict:
    from fastapi import HTTPException
    from services.admin_service import is_admin_user
    if not is_admin_user(current_user):
        raise HTTPException(status_code=403, detail="Admin access required")

    result = feedback_repo.get_feedback_by_id(db, feedback_id)
    if not result:
        raise HTTPException(status_code=404, detail="Feedback not found")

    fb, u = result
    send_reply_email(user_email=u.email, username=u.username, reply_message=reply_message)
    feedback_repo.update_feedback_status(db, fb, status="replied")
    return format_feedback_out(fb, u)


