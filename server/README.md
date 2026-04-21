# 🗳️ Encrypted Voting System — FastAPI Backend

A production-ready, secure, and encrypted voting system backend built with FastAPI and MongoDB. This system uses RSA-OAEP for end-to-end encryption of votes and JWT for secure authentication.

## 🚀 Tech Stack

- **Framework**: FastAPI (Python)
- **Database**: MongoDB (Local) via `motor` (Async driver)
- **Authentication**: JWT (`python-jose`) with `bcrypt` password hashing (`passlib`)
- **Encryption**: RSA with OAEP padding and SHA-256 (`cryptography` library)
- **Validation**: Pydantic v2 Models

## 📁 Project Structure

```text
server/
├── main.py                 # Application entry point & router configuration
├── .env                    # Environment variables (Private)
├── .env.example            # Template for environment variables
├── requirements.txt        # Python dependencies
├── seed.py                 # Database initialization & seeding script
├── app/
│   ├── config.py           # Settings and MongoDB connection
│   ├── models/             # Pydantic data models (Voter, Vote, Candidate)
│   ├── routes/             # API endpoints (Auth, Vote, Results)
│   ├── services/           # Business logic (Cryptography, Tallying)
│   └── middleware/         # Security guards and JWT dependencies
```

## 🔐 Security Features

- **Vote Encryption**: Each vote is encrypted with a 2048-bit RSA public key before being stored in the database.
- **Anonymity**: Votes are stored with a SHA-256 hash of the `voter_id` to ensure anonymity while preventing double-voting.
- **Access Control**: Role-based access control (RBAC) ensures only admins can close elections and view results.
- **Decryption**: Private keys are only accessed by the admin during the election closure process to tally results.

## 🛠️ Setup & Installation

### 1. Prerequisites
- Python 3.10+
- MongoDB installed and running locally (`mongodb://localhost:27017`)

### 2. Installation
```powershell
# Navigate to server directory
cd server

# Create and activate virtual environment
python -m venv venv
.\venv\Scripts\Activate.ps1

# Install dependencies
pip install -r requirements.txt
```

### 3. Environment Configuration
Create a `.env` file based on `.env.example`:
```ini
PORT=3000
HOST=0.0.0.0
MONGO_URI=mongodb://localhost:27017
DB_NAME=voting_db
JWT_SECRET=your_secure_random_secret
JWT_ALGORITHM=HS256
JWT_EXPIRY_HOURS=2
```

### 4. Database Seeding
Initialize the database with dummy voters and candidates:
```powershell
python seed.py
```
*This will print the generated credentials to your console.*

### 5. Running the Application
```powershell
python main.py
```
The API will be available at `http://localhost:3000`. You can access the interactive documentation at `http://localhost:3000/docs`.

## 📡 API Endpoints

| Method | Route | Purpose | Auth Required |
|--------|-------|---------|---------------|
| GET | `/health` | Health check | ❌ |
| POST | `/api/auth/login` | Voter login, returns JWT | ❌ |
| GET | `/api/candidates` | Get all candidates | ✅ Voter JWT |
| POST | `/api/vote` | Cast and encrypt vote | ✅ Voter JWT |
| POST | `/api/admin/close-election` | Lock voting & tally results | ✅ Admin JWT |
| GET | `/api/results` | Get final tally | ✅ Admin JWT |

## 🧪 Testing with cURL

**Login:**
```bash
curl -X POST http://localhost:3000/api/auth/login -H "Content-Type: application/json" -d "{\"voter_id\": \"V001\", \"password\": \"password123\"}"
```

**Cast Vote:**
```bash
curl -X POST http://localhost:3000/api/vote -H "Authorization: Bearer <token>" -H "Content-Type: application/json" -d "{\"candidate_id\": \"C001\"}"
```
