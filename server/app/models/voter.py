from pydantic import BaseModel, Field
from typing import Optional

class VoterBase(BaseModel):
    """
    Base model for Voter containing common fields.
    """
    voter_id: str
    name: str
    role: str = "voter"

class Voter(VoterBase):
    """
    Full Voter model with security fields.
    """
    password_hash: str
    has_voted: bool = False

class VoterLogin(BaseModel):
    """
    Model for voter login requests.
    """
    voter_id: str
    password: str

class VoterResponse(VoterBase):
    """
    Model for voter information returned to the client.
    """
    has_voted: bool
