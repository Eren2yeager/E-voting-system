from fastapi import APIRouter, Depends, HTTPException, status
from app.config import db, ELECTION_KEYS_COLLECTION, RESULTS_COLLECTION
from app.middleware.auth_guard import get_admin_voter
from app.services.vote_counter import tally_votes

router = APIRouter(tags=["Results"])

@router.post("/admin/close-election")
async def close_election(admin: dict = Depends(get_admin_voter)):
    """
    Lock voting, decrypt all votes, return tally.
    Requires Admin JWT.
    """
    # 1. Verify election keys exist
    election_keys = await db[ELECTION_KEYS_COLLECTION].find_one({})
    if not election_keys:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Election keys not found"
        )
    
    # 2. Set voting_open = False in election_keys
    await db[ELECTION_KEYS_COLLECTION].update_one(
        {},
        {"$set": {"voting_open": False}}
    )
    
    # 3. Decrypt all votes and count occurrences
    tally_result = await tally_votes()
    
    if "error" in tally_result:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=tally_result["error"]
        )
    
    return tally_result

@router.get("/results")
async def get_results(admin: dict = Depends(get_admin_voter)):
    """
    Get final tally (only after election closed).
    Requires Admin JWT.
    """
    # 1. Check if election is closed
    election_keys = await db[ELECTION_KEYS_COLLECTION].find_one({})
    if not election_keys or election_keys.get("voting_open"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Election not closed yet"
        )
    
    # 2. Fetch latest document from results collection
    latest_result = await db[RESULTS_COLLECTION].find_one(
        sort=[("timestamp", -1)]
    )
    
    if not latest_result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Results not found"
        )
    
    # Convert MongoDB _id to string or just return needed fields
    return {
        "tally": latest_result["tally"],
        "total_votes": latest_result["total_votes"],
        "timestamp": latest_result["timestamp"]
    }
