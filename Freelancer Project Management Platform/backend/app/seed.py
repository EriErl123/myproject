"""
Seed the database with demo users so the platform is immediately usable.
Run:  python -m app.seed
"""

from app.db import Base, SessionLocal, engine
from app.core.security import get_password_hash
from app.models import User, Role

DEMO_USERS = [
    {
        "email": "admin@demo.com",
        "full_name": "Admin User",
        "password": "admin123",
        "role": Role.admin,
    },
    {
        "email": "client@demo.com",
        "full_name": "Demo Client",
        "password": "client123",
        "role": Role.client,
    },
    {
        "email": "freelancer@demo.com",
        "full_name": "Demo Freelancer",
        "password": "freelancer123",
        "role": Role.freelancer,
    },
]


def seed():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    created = 0

    try:
        for u in DEMO_USERS:
            exists = db.query(User).filter(User.email == u["email"]).first()
            if exists:
                continue

            user = User(
                email=u["email"],
                full_name=u["full_name"],
                password_hash=get_password_hash(u["password"]),
                role=u["role"],
                is_active=True,
            )
            db.add(user)
            created += 1

        db.commit()
        print(f"  Seed complete – {created} new user(s) inserted.")
    finally:
        db.close()


if __name__ == "__main__":
    seed()
