from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from datetime import datetime, timedelta
from app.config import settings
from typing import Optional

# OAuth2 scheme for token extraction
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

def create_access_token(data: dict):
    """
    Create a JWT access token.
    """
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(hours=settings.JWT_EXPIRY_HOURS)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)
    return encoded_jwt

async def get_current_voter(token: str = Depends(oauth2_scheme)):
    """
    Dependency to verify JWT and return voter payload.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
        voter_id: str = payload.get("voter_id")
        role: str = payload.get("role")
        if voter_id is None or role is None:
            raise credentials_exception
        return {"voter_id": voter_id, "role": role}
    except JWTError:
        raise credentials_exception

async def get_admin_voter(current_voter: dict = Depends(get_current_voter)):
    """
    Dependency to verify current voter is an admin.
    """
    if current_voter.get("role") != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have administrative privileges"
        )
    return current_voter
