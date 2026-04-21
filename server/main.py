from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import auth, vote, results
from app.config import settings
import uvicorn

app = FastAPI(title=settings.PROJECT_NAME)

# CORS configuration for the React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health check route
@app.get("/health")
def read_health():
    """
    Health check endpoint.
    """
    return {"status": "healthy", "project": settings.PROJECT_NAME}

# Include routers with /api prefix
app.include_router(auth.router, prefix="/api")
app.include_router(vote.router, prefix="/api")
app.include_router(results.router, prefix="/api")

if __name__ == "__main__":
    # Run the application using uvicorn
    uvicorn.run(
        "main:app", 
        host=settings.HOST, 
        port=settings.PORT, 
        reload=True
    )
