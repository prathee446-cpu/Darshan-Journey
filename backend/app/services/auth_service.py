import time
import bcrypt
from jose import jwt, JWTError
from app.config import settings

def hash_password(password: str) -> str:
    # Truncate to max 72 bytes as required by bcrypt
    safe_pwd_bytes = password.encode('utf-8')[:72]
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(safe_pwd_bytes, salt)
    return hashed.decode('utf-8')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        safe_pwd_bytes = plain_password.encode('utf-8')[:72]
        hashed_bytes = hashed_password.encode('utf-8')
        return bcrypt.checkpw(safe_pwd_bytes, hashed_bytes)
    except Exception:
        return False

def create_jwt_token(data: dict) -> str:
    to_encode = data.copy()
    expire = time.time() + (settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60)
    to_encode.update({"exp": expire})
    token = jwt.encode(to_encode, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)
    return token

def decode_jwt_token(token: str) -> dict:
    try:
        decoded = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
        return decoded
    except JWTError:
        return {}
