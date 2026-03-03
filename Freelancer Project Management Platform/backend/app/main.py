import os
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.db import Base, engine
from app.routers import admin, auth, dashboard, projects


@asynccontextmanager
async def lifespan(application: FastAPI):
    # Startup: ensure tables exist
    Base.metadata.create_all(bind=engine)
    yield
    # Shutdown: nothing to clean up for now


app = FastAPI(
    title="Freelancer Project Management Platform API",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS – allow env override for production domains
_extra_origins = os.getenv("CORS_ORIGINS", "")
allowed_origins = [
    "http://localhost:5180",
    "http://127.0.0.1:5180",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost",
    "http://127.0.0.1",
    "http://localhost:80",
] + [o.strip() for o in _extra_origins.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def healthcheck():
    return {"status": "ok", "service": "freelancer-pm-api"}


@app.get("/health")
def health():
    return {"status": "healthy"}


app.include_router(auth.router)
app.include_router(projects.router)
app.include_router(dashboard.router)
app.include_router(admin.router)
