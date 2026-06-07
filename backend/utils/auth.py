"""
JWT helpers + password hashing.
"""

from datetime import datetime, timedelta
from typing import Optional

from jose import jwt, JWTError
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer

from config import SECRET_KEY, ALGORITHM, ACCESS_TOKEN_EXPIRE_MINUTES

pwd_context   = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")


def hash_password(plain: str) -> str:
    return pwd_context.hash(plain)


def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def decode_token(token: str) -> dict:
    try:
        return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )


def get_current_user(token: str = Depends(oauth2_scheme)) -> dict:
    return decode_token(token)


def require_hospital(current_user: dict = Depends(get_current_user)) -> dict:
    if current_user.get("role") != "hospital":
        raise HTTPException(status_code=403, detail="Hospital access required")
    return current_user


def require_patient(current_user: dict = Depends(get_current_user)) -> dict:
    if current_user.get("role") != "patient":
        raise HTTPException(status_code=403, detail="Patient access required")
    return current_user


def require_any_role(current_user: dict = Depends(get_current_user)) -> dict:
    return current_user


def get_current_user_optional(token: str = Depends(oauth2_scheme)) -> Optional[dict]:
    try:
        return decode_token(token)
    except HTTPException:
        return None