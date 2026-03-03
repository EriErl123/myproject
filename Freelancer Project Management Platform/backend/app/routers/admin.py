from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.db import get_db
from app.deps import require_role
from app.models import Project, Proposal, Role, User
from app.schemas import UserOut

router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("/users", response_model=list[UserOut])
def list_users(_: User = Depends(require_role(Role.admin)), db: Session = Depends(get_db)):
    return db.query(User).all()


@router.patch("/users/{user_id}/suspend", response_model=UserOut)
def suspend_user(user_id: int, _: User = Depends(require_role(Role.admin)), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    user.is_active = False
    db.commit()
    db.refresh(user)
    return user


@router.patch("/users/{user_id}/activate", response_model=UserOut)
def activate_user(user_id: int, _: User = Depends(require_role(Role.admin)), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    user.is_active = True
    db.commit()
    db.refresh(user)
    return user


@router.delete("/users/{user_id}")
def delete_user(user_id: int, _: User = Depends(require_role(Role.admin)), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    db.delete(user)
    db.commit()
    return {"ok": True}


@router.get("/stats")
def admin_stats(_: User = Depends(require_role(Role.admin)), db: Session = Depends(get_db)):
    return {
        "users_total": db.query(func.count(User.id)).scalar() or 0,
        "users_active": db.query(func.count(User.id)).filter(User.is_active.is_(True)).scalar() or 0,
        "projects_total": db.query(func.count(Project.id)).scalar() or 0,
        "proposals_total": db.query(func.count(Proposal.id)).scalar() or 0,
    }
