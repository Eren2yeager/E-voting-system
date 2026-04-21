from collections import Counter
from app.config import db, VOTES_COLLECTION, CANDIDATES_COLLECTION, ELECTION_KEYS_COLLECTION, RESULTS_COLLECTION
from app.services.crypto import decrypt_vote
from datetime import datetime

async def tally_votes():
    """
    Decrypt all votes, count occurrences, and cross-reference with candidates.
    Stores results in the results collection.
    Returns: Tally result with candidate details.
    """
    # 1. Fetch all votes
    votes_cursor = db[VOTES_COLLECTION].find({})
    votes = await votes_cursor.to_list(length=None)
    
    # 2. Fetch election keys (for private key)
    election_keys = await db[ELECTION_KEYS_COLLECTION].find_one({})
    if not election_keys:
        return {"error": "Election keys not found"}
    
    private_key_pem = election_keys["private_key"]
    
    # 3. Decrypt each vote and collect candidate_ids
    candidate_id_counts = Counter()
    for vote in votes:
        encrypted_vote = vote["encrypted_vote"]
        try:
            candidate_id = decrypt_vote(encrypted_vote, private_key_pem)
            candidate_id_counts[candidate_id] += 1
        except Exception as e:
            # In a production app, we should log this error properly
            print(f"Failed to decrypt vote: {e}")
            continue
            
    # 4. Cross-reference with candidates collection to get full details
    tally = []
    candidates_cursor = db[CANDIDATES_COLLECTION].find({})
    async for candidate in candidates_cursor:
        candidate_id = candidate["candidate_id"]
        tally.append({
            "candidate_id": candidate_id,
            "name": candidate["name"],
            "party": candidate["party"],
            "vote_count": candidate_id_counts.get(candidate_id, 0)
        })
        
    # 5. Sort tally by vote_count descending
    tally.sort(key=lambda x: x["vote_count"], reverse=True)
    
    # 6. Store final tally in results collection
    result_doc = {
        "tally": tally,
        "total_votes": sum(candidate_id_counts.values()),
        "timestamp": datetime.utcnow()
    }
    await db[RESULTS_COLLECTION].insert_one(result_doc)
    
    return result_doc
