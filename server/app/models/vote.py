from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional

class Vote(BaseModel):
    """
    Model representing a cast vote.
    """
    voter_id_hash: str
    encrypted_vote: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class VoteRequest(BaseModel):
    """
    Model for the cast vote request body.
    """
    candidate_id: str
