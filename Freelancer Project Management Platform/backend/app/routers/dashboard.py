from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.db import get_db
from app.deps import get_current_user
from app.models import Project, ProjectStatus, Proposal, ProposalStatus, Role, User

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("/summary")
def dashboard_summary(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    metrics = {}

    if current_user.role == Role.client:
        projects_query = db.query(Project).filter(Project.client_id == current_user.id)
        project_ids = [p.id for p in projects_query.all()]
        metrics = {
            "projects_total": len(project_ids),
            "projects_open": db.query(func.count(Project.id))
            .filter(Project.client_id == current_user.id, Project.status == ProjectStatus.open)
            .scalar()
            or 0,
            "projects_in_progress": db.query(func.count(Project.id))
            .filter(Project.client_id == current_user.id, Project.status == ProjectStatus.in_progress)
            .scalar()
            or 0,
            "projects_completed": db.query(func.count(Project.id))
            .filter(Project.client_id == current_user.id, Project.status == ProjectStatus.completed)
            .scalar()
            or 0,
            "proposals_pending": db.query(func.count(Proposal.id))
            .filter(Proposal.project_id.in_(project_ids) if project_ids else False, Proposal.status == ProposalStatus.pending)
            .scalar()
            or 0,
        }
    elif current_user.role == Role.freelancer:
        my_proposals = db.query(Proposal).filter(Proposal.freelancer_id == current_user.id)
        earnings = (
            db.query(func.coalesce(func.sum(Proposal.bid_amount), 0))
            .filter(Proposal.freelancer_id == current_user.id, Proposal.status == ProposalStatus.approved)
            .scalar()
            or 0
        )
        metrics = {
            "proposals_total": my_proposals.count(),
            "proposals_pending": my_proposals.filter(Proposal.status == ProposalStatus.pending).count(),
            "proposals_approved": my_proposals.filter(Proposal.status == ProposalStatus.approved).count(),
            "proposals_rejected": my_proposals.filter(Proposal.status == ProposalStatus.rejected).count(),
            "earnings": float(earnings),
        }
    else:
        metrics = {
            "users_total": db.query(func.count(User.id)).scalar() or 0,
            "projects_total": db.query(func.count(Project.id)).scalar() or 0,
            "proposals_total": db.query(func.count(Proposal.id)).scalar() or 0,
        }

    return {
        "user": {
            "id": current_user.id,
            "name": current_user.full_name,
            "role": current_user.role,
        },
        "metrics": metrics,
    }
