import pytest
from core.security import create_access_token, decode_access_token, ALGORITHM
from jose import jwt
from core.config import settings

def test_jwt_none_algorithm_rejected():
    token = create_access_token(1)
    # create a fake token with algorithm "none"
    header = {"alg": "none", "typ": "JWT"}
    payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[ALGORITHM])

    import json
    import base64

    def b64url(data):
        return base64.urlsafe_b64encode(data).decode('utf-8').rstrip('=')

    encoded_header = b64url(json.dumps(header).encode())
    encoded_payload = b64url(json.dumps(payload).encode())

    fake_token = f"{encoded_header}.{encoded_payload}."

    user_id = decode_access_token(fake_token)
    assert user_id is None, "Algorithm none should be rejected"
