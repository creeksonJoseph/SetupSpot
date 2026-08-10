# Integration: Resend Email Service

Resend is the transactional email gateway used by SetupSpot to send One-Time Password (OTP) verification emails during account registration and password resets.

---

## 🔌 Connection & Client Wiring

- **Client Setup File**: [`backend/core/email.py`](file:///home/creeksonjoseph/softwarengineering/personal-projects/SetupSpot/backend/core/email.py)
  - `init_resend()` sets `resend.api_key = settings.RESEND_API_KEY`.
- **Email Dispatch Methods**:
  - `send_otp_email(to_email, otp)`: Sends HTML transactional email containing 6-digit signup OTP code.
  - `send_password_reset_email(to_email, otp)`: Sends HTML email containing 6-digit password reset OTP code.

---

## 🔑 Environment Variables Required

| Variable Name | Description | Where Read |
| :--- | :--- | :--- |
| `RESEND_API_KEY` | Resend API Key (starts with `re_`) | [`config.py`](file:///home/creeksonjoseph/softwarengineering/personal-projects/SetupSpot/backend/core/config.py#L13) |

---

## 🔄 Data Flow

1. User submits email address on Signup or Forgot Password view.
2. Backend generates a secure 6-digit numeric OTP code.
3. Backend stores OTP in Upstash Redis (`ttl_seconds=600`).
4. `send_otp_email` invokes Resend Python SDK `resend.Emails.send(...)`.
5. User receives HTML email with OTP code.
6. User inputs OTP on frontend -> Backend validates code against Redis (`get_otp`).

---

## 🛡️ Failure Behavior & Fallbacks

- **SDK Exceptions**: Resend API calls are wrapped in `try...except Exception`. If email sending fails (e.g. invalid API key or network error), backend logs the error and raises `HTTP 500 Internal Server Error` with detail `"Failed to send email"`.
- **Missing API Key**: If `RESEND_API_KEY` is empty, Resend calls will raise an exception.

---

## 💡 Gotchas

- **Sandbox Domain Limitations**: Without a verified custom domain on Resend, Resend restricts email delivery strictly to the email address used to register the Resend account (`onboarding@resend.dev`). For production deployments, verify your domain in Resend DNS settings.
