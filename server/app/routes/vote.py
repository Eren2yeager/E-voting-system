import hashlib
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from app.config import db, VOTERS_COLLECTION, VOTES_COLLECTION, CANDIDATES_COLLECTION, ELECTION_KEYS_COLLECTION
from app.models.vote import VoteRequest
from app.middleware.auth_guard import get_current_voter
from app.services.crypto import encrypt_vote

router = APIRouter(tags=["Voting"])

@router.get("/candidates")
async def get_candidates(current_voter: dict = Depends(get_current_voter)):
    """
    Get all candidates from the collection.
    Requires Voter JWT.
    """
    candidates_cursor = db[CANDIDATES_COLLECTION].find({}, {"_id": 0})
    candidates = await candidates_cursor.to_list(length=100)
    return candidates

@router.post("/vote")
async def cast_vote(vote_request: VoteRequest, current_voter: dict = Depends(get_current_voter)):
    """
    Cast and encrypt a vote for a candidate.
    Requires Voter JWT.
    """
    voter_id = current_voter["voter_id"]
    
    # 1. Check if voter has already voted
    voter = await db[VOTERS_COLLECTION].find_one({"voter_id": voter_id})
    if voter.get("has_voted"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You have already voted"
        )
    
    # 2. Check if voting is open
    election_keys = await db[ELECTION_KEYS_COLLECTION].find_one({})
    if not election_keys or not election_keys.get("voting_open"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Voting is closed"
        )
    
    # 3. Verify candidate exists
    candidate = await db[CANDIDATES_COLLECTION].find_one({"candidate_id": vote_request.candidate_id})
    if not candidate:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Candidate not found"
        )
    
    # 4. Encrypt vote
    public_key_pem = election_keys["public_key"]
    encrypted_vote_b64 = encrypt_vote(vote_request.candidate_id, public_key_pem)
    
    # 5. Create voter_id hash (SHA-256)
    voter_id_hash = hashlib.sha256(voter_id.encode('utf-8')).hexdigest()
    
    # 6. Insert into votes collection
    new_vote = {
        "voter_id_hash": voter_id_hash,
        "encrypted_vote": encrypted_vote_b64,
        "timestamp": datetime.utcnow()
    }
    await db[VOTES_COLLECTION].insert_one(new_vote)
    
    # 7. Update voter status
    await db[VOTERS_COLLECTION].update_one(
        {"voter_id": voter_id},
        {"$set": {"has_voted": True}}
    )
    
    return {"message": "Vote cast successfully"}
