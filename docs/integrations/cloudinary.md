# Integration: Cloudinary Image Management

Cloudinary is the cloud image hosting, transformation, and CDN delivery platform used for user setup photos and avatar uploads.

---

## 🔌 Connection & Client Wiring

- **Backend Singleton Wiring**: [`backend/core/cloudinary_client.py`](file:///home/creeksonjoseph/softwarengineering/personal-projects/SetupSpot/backend/core/cloudinary_client.py)
  - `init_cloudinary()` configures global `cloudinary.config(cloud_name, api_key, api_secret, secure=True)`.
- **Early Upload Endpoint**: [`backend/api/routers/early_upload.py`](file:///home/creeksonjoseph/softwarengineering/personal-projects/SetupSpot/backend/api/routers/early_upload.py#L25)
  - Accepts raw image file upload via `POST /api/early-upload`.
  - Executes `cloudinary.uploader.upload(file, folder="setups", upload_preset=...)`.
  - Returns HTTPS Cloudinary URL string (`secure_url`).

---

## 🔑 Environment Variables Required

| Variable Name | Description | Where Read |
| :--- | :--- | :--- |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary account Cloud Name | [`config.py`](file:///home/creeksonjoseph/softwarengineering/personal-projects/SetupSpot/backend/core/config.py#L7) |
| `CLOUDINARY_API_KEY` | Cloudinary API Key | [`config.py`](file:///home/creeksonjoseph/softwarengineering/personal-projects/SetupSpot/backend/core/config.py#L8) |
| `CLOUDINARY_API_SECRET` | Cloudinary API Secret | [`config.py`](file:///home/creeksonjoseph/softwarengineering/personal-projects/SetupSpot/backend/core/config.py#L9) |
| `CLOUDINARY_UPLOAD_PRESET` | Upload Preset Name (default: `SetupSpot`) | [`config.py`](file:///home/creeksonjoseph/softwarengineering/personal-projects/SetupSpot/backend/core/config.py#L10) |

---

## 🔄 Data Flow & Early Upload Pattern

```
1. User selects image in Create Setup flow
2. Frontend immediately POSTs image binary to POST /api/early-upload
3. Backend uploads to Cloudinary API -> receives https://res.cloudinary.com/.../image.jpg
4. Backend returns { "image_url": "https://..." }
5. Frontend stores URL string in local draft (useSetupDraft)
6. User completes gear annotations at their own pace
7. On final submission POST /setups, frontend sends pre-uploaded URL string (0 re-uploads)
```

---

## 🛡️ Failure Behavior & Fallbacks

- **Upload Failures**: If Cloudinary credentials are invalid or network fails during `early_upload.py`, backend returns `HTTP 500 Internal Server Error` with detail `"Image upload failed"`.
- **File Validation**: `early_upload.py` validates file content types before uploading to Cloudinary.

---

## 💡 Gotchas

- **Auto CDN Optimization**: Cloudinary URLs support dynamic transformation parameters. SetupSpot serves all images over HTTPS CDN.
- **Unsigned Presets**: In development, ensure the preset name specified in `CLOUDINARY_UPLOAD_PRESET` matches the preset created in Cloudinary Console settings.
