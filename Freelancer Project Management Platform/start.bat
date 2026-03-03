@echo off
title Freelancer PM Platform - Launcher
color 0B
cls

echo ============================================================
echo     Freelancer Project Management Platform
echo     One-Click Launcher
echo ============================================================
echo.

:: ── Check prerequisites ──────────────────────────────────────
where python >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Python is not installed or not in PATH.
    echo         Download from https://www.python.org/downloads/
    pause
    exit /b 1
)

where node >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed or not in PATH.
    echo         Download from https://nodejs.org/
    pause
    exit /b 1
)

echo [OK] Python found:
python --version
echo [OK] Node.js found:
node --version
echo.

:: ── Set up backend ───────────────────────────────────────────
echo [1/6] Setting up backend virtual environment...
cd /d "%~dp0backend"

if not exist ".venv" (
    python -m venv .venv
    echo       Virtual environment created.
) else (
    echo       Virtual environment already exists.
)

echo [2/6] Installing backend dependencies...
call .venv\Scripts\activate.bat
pip install -r requirements.txt --quiet 2>nul
echo       Backend dependencies installed.

:: ── Create .env if missing ───────────────────────────────────
if not exist ".env" (
    echo [2b]  Creating backend .env from template...
    copy /Y "%~dp0.env.example" ".env" >nul
    echo       .env file created. Edit backend\.env to customise.
)

:: ── Seed database ────────────────────────────────────────────
echo [3/6] Seeding database (admin + demo users)...
python -m app.seed
echo       Database seeded.

:: ── Set up frontend ──────────────────────────────────────────
cd /d "%~dp0frontend"

echo [4/6] Installing frontend dependencies...
call npm install --silent 2>nul
echo       Frontend dependencies installed.

:: ── Create frontend .env if missing ──────────────────────────
if not exist ".env" (
    echo VITE_API_URL=http://127.0.0.1:8000> ".env"
    echo       Frontend .env created.
)

:: ── Launch servers ───────────────────────────────────────────
echo.
echo [5/6] Starting FastAPI backend on http://127.0.0.1:8000 ...
cd /d "%~dp0backend"
start "Backend - FastAPI" cmd /k "call .venv\Scripts\activate.bat && python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000"

:: Give the backend a moment to bind
timeout /t 3 /nobreak >nul

echo [6/6] Starting Vite frontend on http://localhost:5180 ...
cd /d "%~dp0frontend"
start "Frontend - Vite" cmd /k "npm run dev"

:: ── Done ─────────────────────────────────────────────────────
timeout /t 3 /nobreak >nul
echo.
echo ============================================================
echo   READY!
echo.
echo   Backend API   : http://127.0.0.1:8000
echo   Swagger Docs  : http://127.0.0.1:8000/docs
echo   Frontend App  : http://localhost:5180
echo.
echo   Demo accounts (seeded):
echo     admin@demo.com      / admin123     (admin)
echo     client@demo.com     / client123    (client)
echo     freelancer@demo.com / freelancer123 (freelancer)
echo.
echo   Press any key to open the app in your browser...
echo ============================================================
pause >nul
start http://localhost:5180
