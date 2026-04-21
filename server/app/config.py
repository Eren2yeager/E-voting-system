import os
from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient

# Load environment variables from .env file
load_dotenv()

class Settings:
    """
    Application settings loaded from environment variables.
    """
    PROJECT_NAME: str = "Encrypted Voting System"
    PORT: int = int(os.getenv("PORT", 3000))
    HOST: str = os.getenv("HOST", "0.0.0.0")
    
    # MongoDB configuration
    MONGO_URI: str = os.getenv("MONGO_URI", "mongodb://localhost:27017")
    DB_NAME: str = os.getenv("DB_NAME", "voting_db")
    
    # JWT configuration
    JWT_SECRET: str = os.getenv("JWT_SECRET", "fallback_secret_key")
    JWT_ALGORITHM: str = os.getenv("JWT_ALGORITHM", "HS256")
    JWT_EXPIRY_HOURS: int = int(os.getenv("JWT_EXPIRY_HOURS", 2))

# Initialize settings
settings = Settings()

# MongoDB client and database initialization
client = AsyncIOMotorClient(settings.MONGO_URI)
db = client[settings.DB_NAME]

# Collection names for easy access
VOTERS_COLLECTION = "voters"
VOTES_COLLECTION = "votes"
CANDIDATES_COLLECTION = "candidates"
ELECTION_KEYS_COLLECTION = "election_keys"
RESULTS_COLLECTION = "results"
