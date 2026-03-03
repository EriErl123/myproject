# Freelancer Project & Client Management System

Full-stack starter project with a dark blue, black, and white UI theme.

## Stack
- Frontend: React + Vite
- Backend: FastAPI + JWT + SQLAlchemy
- Database: PostgreSQL (or SQLite for local fallback)

## Features included
- JWT authentication
- Role-based access (`admin`, `client`, `freelancer`)
- Project creation/listing/status updates
- Proposal submission + client approve/reject workflow
- Task creation/listing/completion workflow
- Dashboard metrics by role (client/freelancer/admin)
- Admin user management (list, suspend, activate)
- Themed responsive dashboard layout

## Quick Start

### Prerequisites
- Python 3.11+ installed
- Node.js 20+ installed

### 1) Backend (PowerShell)
From project root:

1. Go to backend folder
	- `cd backend`
2. Create virtual environment
	- `python -m venv .venv`
3. Activate virtual environment
	- `.\.venv\Scripts\Activate.ps1`
4. Install dependencies
	- `pip install -r requirements.txt`
5. Create local env file (do not run `.env.example` as a command)
	- `Copy-Item ..\.env.example .env`
6. Start API server
	- `uvicorn app.main:app --reload`

Backend URLs:
- API: http://127.0.0.1:8000
- Swagger docs: http://127.0.0.1:8000/docs

### 2) Frontend (PowerShell)
Open a new terminal from project root:

1. Go to frontend folder
	- `cd frontend`
2. Install dependencies
	- `npm install`
3. Run dev server
	- `npm run dev`

Frontend URL:
- App: http://localhost:5180

### 3) Run both together
- Keep backend terminal running in `backend`
- Keep frontend terminal running in `frontend`

### 4) First functional test (important)
1. Open `http://localhost:5180`
2. Click **Register**
3. Create a user with role:
	- `client` (can create projects), or
	- `freelancer` (can view projects)
4. Login with the same account
5. If role is `client`, use **Create Project** form
6. Confirm new project appears in the Projects table

### Common issues
- `npm run dev` fails with missing packages:
  - run `npm install` first in `frontend`
- `npm` or `node` is not recognized:
	- close and reopen VS Code/PowerShell after Node.js install
	- ensure `C:\Program Files\nodejs` is in your PATH
	- temporary fix in current terminal: `$env:Path = "C:\Program Files\nodejs;" + $env:Path`
- Another project opens in browser:
	- open exactly `http://localhost:5180` for this project
	- stop old Vite servers in other folders (`Ctrl + C` in their terminals)
- `uvicorn` not recognized:
  - ensure venv is activated, then run `python -m uvicorn app.main:app --reload`
- `email-validator is not installed` error:
	- run `pip install -r requirements.txt` again inside `backend`
- PowerShell script execution blocked:
  - run once in PowerShell as Administrator:
	 - `Set-ExecutionPolicy RemoteSigned -Scope CurrentUser`
- CORS/API URL mismatch:
  - set `VITE_API_URL=http://127.0.0.1:8000` in project `.env` if needed

## Default Roles
- `admin`
- `client`
- `freelancer`

## Notes
- Set `DATABASE_URL` to PostgreSQL for production.
- This is a clean starter implementation aligned with your brief.
