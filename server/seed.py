import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from passlib.hash import bcrypt
from app.config import settings, VOTERS_COLLECTION, CANDIDATES_COLLECTION, ELECTION_KEYS_COLLECTION, VOTES_COLLECTION, RESULTS_COLLECTION
from app.services.crypto import generate_rsa_keys

async def seed_database():
    """
    Seed the MongoDB database with initial voters, candidates, and RSA keys.
    """
    print(f"Connecting to MongoDB at {settings.MONGO_URI}...")
    client = AsyncIOMotorClient(settings.MONGO_URI)
    db = client[settings.DB_NAME]
    
    # 1. Drop existing collections
    collections = [VOTERS_COLLECTION, CANDIDATES_COLLECTION, ELECTION_KEYS_COLLECTION, VOTES_COLLECTION, RESULTS_COLLECTION]
    for collection in collections:
        print(f"Dropping collection: {collection}")
        await db[collection].drop()
        
    # 2. Seed Voters
    print("Seeding voters...")
    voter_data = [
        {"voter_id": "V001", "name": "Rahul Sharma", "password": "password123", "role": "voter"},
        {"voter_id": "V002", "name": "Priya Singh", "password": "password123", "role": "voter"},
        {"voter_id": "V003", "name": "Amit Kumar", "password": "password123", "role": "voter"},
        {"voter_id": "V004", "name": "Sneha Patel", "password": "password123", "role": "voter"},
        {"voter_id": "V005", "name": "Vikram Rao", "password": "password123", "role": "voter"},
        {"voter_id": "ADMIN001", "name": "Election Admin", "password": "adminpassword", "role": "admin"}
    ]
    
    seeded_voters = []
    for v in voter_data:
        voter_doc = {
            "voter_id": v["voter_id"],
            "name": v["name"],
            "password_hash": bcrypt.hash(v["password"]),
            "has_voted": False,
            "role": v["role"]
        }
        await db[VOTERS_COLLECTION].insert_one(voter_doc)
        seeded_voters.append(v)
        
    # 3. Seed Candidates
    print("Seeding candidates...")
    candidates = [
        {"candidate_id": "C001", "name": "Amit Verma", "party": "Party A"},
        {"candidate_id": "C002", "name": "Sunita Gupta", "party": "Party B"},
        {"candidate_id": "C003", "name": "Rajesh Khanna", "party": "Independent"}
    ]
    await db[CANDIDATES_COLLECTION].insert_many(candidates)
    
    # 4. Generate RSA Keys and Initialize Election Status
    print("Generating RSA keys...")
    public_key, private_key = generate_rsa_keys()
    
    election_keys_doc = {
        "public_key": public_key,
        "private_key": private_key,
        "voting_open": True
    }
    await db[ELECTION_KEYS_COLLECTION].insert_one(election_keys_doc)
    
    print("\n" + "="*50)
    print("SEEDING COMPLETE")
    print("="*50)
    print("\nVoter Credentials (for testing):")
    for v in seeded_voters:
        print(f"ID: {v['voter_id']:<10} | Password: {v['password']:<15} | Role: {v['role']}")
    print("="*50)

if __name__ == "__main__":
    asyncio.run(seed_database())
