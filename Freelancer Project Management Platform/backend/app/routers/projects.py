from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db import get_db
from app.deps import get_current_user, require_role
from app.models import Project, ProjectStatus, Proposal, ProposalStatus, Role, Task, User
from app.schemas import (
    ProjectCreate,
    ProjectOut,
    ProjectStatusUpdate,
    ProposalCreate,
    ProposalOut,
    ProposalReview,
    TaskCreate,
    TaskOut,
    TaskUpdate,
)

router = APIRouter(prefix="/projects", tags=["projects"])


@router.post("", response_model=ProjectOut)
def create_project(
    payload: ProjectCreate,
    current_user: User = Depends(require_role(Role.client)),
    db: Session = Depends(get_db),
):
    project = Project(
        title=payload.title,
        description=payload.description,
        budget=payload.budget,
        client_id=current_user.id,
        status=ProjectStatus.open,
    )
    db.add(project)
    db.commit()
    db.refresh(project)
    return project


@router.get("", response_model=list[ProjectOut])
def list_projects(db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    return db.query(Project).all()


@router.get("/my-client", response_model=list[ProjectOut])
def list_my_client_projects(
    db: Session = Depends(get_db), current_user: User = Depends(require_role(Role.client))
):
    return db.query(Project).filter(Project.client_id == current_user.id).all()


@router.patch("/{project_id}/status", response_model=ProjectOut)
def update_project_status(
    project_id: int,
    payload: ProjectStatusUpdate,
    current_user: User = Depends(require_role(Role.client)),
    db: Session = Depends(get_db),
):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
    if project.client_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not your project")

    project.status = payload.status
    db.commit()
    db.refresh(project)
    return project


@router.post("/{project_id}/proposals", response_model=ProposalOut)
def submit_proposal(
    project_id: int,
    payload: ProposalCreate,
    current_user: User = Depends(require_role(Role.freelancer)),
    db: Session = Depends(get_db),
):
    if payload.project_id != project_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="project_id mismatch")

    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")

    if project.status != ProjectStatus.open:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Project is not open")

    existing = (
        db.query(Proposal)
        .filter(Proposal.project_id == project_id, Proposal.freelancer_id == current_user.id)
        .first()
    )
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Proposal already submitted")

    proposal = Proposal(
        project_id=project_id,
        freelancer_id=current_user.id,
        cover_letter=payload.cover_letter,
        bid_amount=payload.bid_amount,
        status=ProposalStatus.pending,
    )
    db.add(proposal)
    db.commit()
    db.refresh(proposal)
    return proposal


@router.get("/my-proposals", response_model=list[ProposalOut])
def list_my_proposals(
    db: Session = Depends(get_db), current_user: User = Depends(require_role(Role.freelancer))
):
    return db.query(Proposal).filter(Proposal.freelancer_id == current_user.id).all()


@router.get("/{project_id}/proposals", response_model=list[ProposalOut])
def list_project_proposals(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")

    if current_user.role == Role.client and project.client_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not your project")
    if current_user.role == Role.freelancer:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Insufficient permissions")

    return db.query(Proposal).filter(Proposal.project_id == project_id).all()


@router.patch("/proposals/{proposal_id}/status", response_model=ProposalOut)
def review_proposal(
    proposal_id: int,
    payload: ProposalReview,
    current_user: User = Depends(require_role(Role.client)),
    db: Session = Depends(get_db),
):
    proposal = db.query(Proposal).filter(Proposal.id == proposal_id).first()
    if not proposal:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Proposal not found")

    project = db.query(Project).filter(Project.id == proposal.project_id).first()
    if not project or project.client_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not your project")

    proposal.status = payload.status
    db.commit()
    db.refresh(proposal)
    return proposal


@router.post("/{project_id}/tasks", response_model=TaskOut)
def create_task(
    project_id: int,
    payload: TaskCreate,
    current_user: User = Depends(require_role(Role.client)),
    db: Session = Depends(get_db),
):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
    if project.client_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not your project")

    task = Task(
        project_id=project_id,
        title=payload.title,
        description=payload.description,
        assignee_id=payload.assignee_id,
        is_done=False,
    )
    db.add(task)
    db.commit()
    db.refresh(task)
    return task


@router.get("/{project_id}/tasks", response_model=list[TaskOut])
def list_project_tasks(
    project_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")

    if current_user.role == Role.client and project.client_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not your project")

    if current_user.role == Role.freelancer:
        has_proposal = (
            db.query(Proposal)
            .filter(Proposal.project_id == project_id, Proposal.freelancer_id == current_user.id)
            .first()
        )
        if not has_proposal:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="No access to this project")

    return db.query(Task).filter(Task.project_id == project_id).all()


@router.patch("/tasks/{task_id}", response_model=TaskOut)
def update_task(
    task_id: int,
    payload: TaskUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")

    project = db.query(Project).filter(Project.id == task.project_id).first()
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")

    is_owner_client = current_user.role == Role.client and project.client_id == current_user.id
    is_assigned_freelancer = current_user.role == Role.freelancer and task.assignee_id == current_user.id

    if not (is_owner_client or is_assigned_freelancer or current_user.role == Role.admin):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Insufficient permissions")

    if payload.title is not None:
        task.title = payload.title
    if payload.description is not None:
        task.description = payload.description
    if payload.assignee_id is not None and is_owner_client:
        task.assignee_id = payload.assignee_id
    if payload.is_done is not None:
        task.is_done = payload.is_done

    db.commit()
    db.refresh(task)
    return task
