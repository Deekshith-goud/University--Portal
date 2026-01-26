from fastapi import FastAPI
from dotenv import load_dotenv
import os

load_dotenv() # Load environment variables from .env file
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.core.database import engine, Base
from app.api import auth, assignments, announcements, events, users, resources, clubs, college_events, college_announcements

@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    yield

app = FastAPI(
    title="Student Portal API",
    description="Role-based Student Portal API",
    version="1.0.0",
    lifespan=lifespan
)

# CORS Setup
# CORS Setup
# Using regex to allow any origin (including local network IPs) while supporting credentials
app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=".*",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(assignments.router)
app.include_router(announcements.router)
app.include_router(events.router)
app.include_router(users.router)
app.include_router(resources.router)
app.include_router(clubs.router)
app.include_router(college_events.router)
app.include_router(college_announcements.router)

from app.api import uploads
app.include_router(uploads.router)

# Mount uploads directory to serve files (e.g. http://localhost:8000/static/filename.pdf)
# We mount 'uploads' root to '/static', so /static/general/foo.jpg works if stored in uploads/general/foo.jpg
from fastapi.staticfiles import StaticFiles
import os
os.makedirs("uploads", exist_ok=True)
app.mount("/static", StaticFiles(directory="uploads"), name="static")

@app.get("/")
def read_root():
    return {"message": "Welcome to Student Portal API"}
