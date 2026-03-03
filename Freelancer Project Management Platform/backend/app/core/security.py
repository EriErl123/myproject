import base64
import hashlib
import hmac
import os
from datetime import datetime, timedelta, timezone

from jose import jwt

from app.core.config import settings

PBKDF2_ITERATIONS = 390000
PBKDF2_SCHEME = "pbkdf2_sha256"


def _pbkdf2_hash(password: str) -> str:
    salt = os.urandom(16)
    digest = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, PBKDF2_ITERATIONS)
    salt_b64 = base64.b64encode(salt).decode("utf-8")
    digest_b64 = base64.b64encode(digest).decode("utf-8")
    return f"{PBKDF2_SCHEME}${PBKDF2_ITERATIONS}${salt_b64}${digest_b64}"


def _pbkdf2_verify(plain_password: str, hashed_password: str) -> bool:
    try:
        scheme, iterations_str, salt_b64, expected_b64 = hashed_password.split("$", 3)
        if scheme != PBKDF2_SCHEME:
            return False
        iterations = int(iterations_str)
        salt = base64.b64decode(salt_b64.encode("utf-8"))
        expected = base64.b64decode(expected_b64.encode("utf-8"))
        actual = hashlib.pbkdf2_hmac("sha256", plain_password.encode("utf-8"), salt, iterations)
        return hmac.compare_digest(actual, expected)
    except Exception:
        return False


def verify_password(plain_password: str, hashed_password: str) -> bool:
    if hashed_password.startswith(f"{PBKDF2_SCHEME}$"):
        return _pbkdf2_verify(plain_password, hashed_password)
    return False


def get_password_hash(password: str) -> str:
    return _pbkdf2_hash(password)


def create_access_token(subject: str, expires_delta: timedelta | None = None) -> str:
    expire = datetime.now(timezone.utc) + (
        expires_delta if expires_delta else timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    payload = {"sub": subject, "exp": expire}
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
