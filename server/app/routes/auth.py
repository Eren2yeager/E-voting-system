from fastapi import APIRouter, HTTPException, status
from passlib.context import CryptContext
from app.config import db, VOTERS_COLLECTION
from app.models.voter import VoterLogin
from app.middleware.auth_guard import create_access_token

router = APIRouter(prefix="/auth", tags=["Authentication"])

# Setup password hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password, hashed_password):
    """
    Verify a plaintext password against its bcrypt hash.
    """
    return pwd_context.verify(plain_password, hashed_password)

@router.post("/login")
async def login(voter_credentials: VoterLogin):
    """
    Voter login endpoint. Returns a JWT on success.
    """
    # Find voter by voter_id
    voter = await db[VOTERS_COLLECTION].find_one({"voter_id": voter_credentials.voter_id})
    
    if not voter:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid voter ID or password"
        )
    
    # Verify password
    if not verify_password(voter_credentials.password, voter["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid voter ID or password"
        )
    
    # Create access token
    access_token = create_access_token(
        data={"voter_id": voter["voter_id"], "role": voter["role"]}
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "voter_id": voter["voter_id"],
        "role": voter["role"],
        "name": voter["name"]
    }
