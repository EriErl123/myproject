from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.db import Base, engine
from app.routers import admin, auth, dashboard, projects

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Freelancer Project Management Platform API", version="1.0.0")

allowed_origins = [
    "http://localhost:5180",
    "http://127.0.0.1:5180",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

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


app.include_router(auth.router)
app.include_router(projects.router)
app.include_router(dashboard.router)
app.include_router(admin.router)
