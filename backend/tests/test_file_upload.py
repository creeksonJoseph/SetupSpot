import pytest
from fastapi.testclient import TestClient
from main import app
from io import BytesIO
from fastapi import UploadFile, HTTPException
import io
from core.file_upload import validate_image_file, validate_image_file_obj

client = TestClient(app)

def test_file_upload_magic_bytes():
    png_file = UploadFile(filename="test.png", file=io.BytesIO(b'\x89PNG\r\n\x1a\n\x00\x00\x00\r'), headers={"content-type": "image/png"})
    validate_image_file(png_file) # Should not raise

    bad_file = UploadFile(filename="test.png", file=io.BytesIO(b'BADMAGICBYTES'), headers={"content-type": "image/png"})
    with pytest.raises(HTTPException) as exc:
        validate_image_file(bad_file)
    assert exc.value.status_code == 400
    assert "Invalid image format" in exc.value.detail

    svg_file = UploadFile(filename="test.svg", file=io.BytesIO(b'<svg><script>alert(1)</script></svg>'), headers={"content-type": "image/svg+xml"})
    with pytest.raises(HTTPException) as exc:
        validate_image_file(svg_file)
    assert exc.value.status_code == 400

    validate_image_file_obj(io.BytesIO(b'\xff\xd8\xff\xdb')) # JPG

    with pytest.raises(HTTPException):
        validate_image_file_obj(io.BytesIO(b'<script>'))
