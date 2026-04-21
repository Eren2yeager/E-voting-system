from pydantic import BaseModel

class Candidate(BaseModel):
    """
    Model representing a candidate in the election.
    """
    candidate_id: str
    name: str
    party: str

class TallyResult(BaseModel):
    """
    Model for final election tally results.
    """
    candidate_id: str
    name: str
    party: str
    vote_count: int
