from pydantic import BaseModel, EmailStr
from app.models import Role, ProjectStatus, ProposalStatus


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserCreate(BaseModel):
    email: EmailStr
    full_name: str
    password: str
    role: Role


class UserOut(BaseModel):
    id: int
    email: EmailStr
    full_name: str
    role: Role
    is_active: bool

    class Config:
        from_attributes = True


class LoginInput(BaseModel):
    email: EmailStr
    password: str


class ProjectCreate(BaseModel):
    title: str
    description: str
    budget: float = 0


class ProjectStatusUpdate(BaseModel):
    status: ProjectStatus


class ProjectOut(BaseModel):
    id: int
    title: str
    description: str
    client_id: int
    status: ProjectStatus
    budget: float

    class Config:
        from_attributes = True


class ProposalCreate(BaseModel):
    project_id: int
    cover_letter: str
    bid_amount: float


class ProposalReview(BaseModel):
    status: ProposalStatus


class ProposalOut(BaseModel):
    id: int
    project_id: int
    freelancer_id: int
    cover_letter: str
    bid_amount: float
    status: ProposalStatus

    class Config:
        from_attributes = True


class TaskCreate(BaseModel):
    title: str
    description: str | None = None
    assignee_id: int | None = None


class TaskUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    assignee_id: int | None = None
    is_done: bool | None = None


class TaskOut(BaseModel):
    id: int
    project_id: int
    title: str
    description: str | None = None
    assignee_id: int | None = None
    is_done: bool

    class Config:
        from_attributes = True
