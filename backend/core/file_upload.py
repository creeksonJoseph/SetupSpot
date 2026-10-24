from fastapi import UploadFile, HTTPException, status

ALLOWED_MAGIC_BYTES = {
    b'\x89PNG\r\n\x1a\n': 'image/png',
    b'\xff\xd8\xff': 'image/jpeg',
    b'GIF87a': 'image/gif',
    b'GIF89a': 'image/gif',
    b'RIFF': 'image/webp',
}

def validate_image_file(file: UploadFile):
    if not file or not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded file must be an image.",
        )

    header = file.file.read(12)
    file.file.seek(0)

    is_valid = False
    for magic, mime in ALLOWED_MAGIC_BYTES.items():
        if header.startswith(magic):
            is_valid = True
            if magic == b'RIFF':
                if header[8:12] != b'WEBP':
                    is_valid = False
            break

    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid image format.",
        )


def validate_image_file_obj(file_obj):
    if file_obj is None:
        return
    header = file_obj.read(12)
    file_obj.seek(0)

    is_valid = False
    for magic, mime in ALLOWED_MAGIC_BYTES.items():
        if header.startswith(magic):
            is_valid = True
            if magic == b'RIFF':
                if header[8:12] != b'WEBP':
                    is_valid = False
            break

    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid image format.",
        )
