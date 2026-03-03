@echo off
title Freelancer PM Platform - Shutdown
echo Stopping Freelancer PM Platform services...
echo.

:: Kill backend (uvicorn on port 8000)
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":8000" ^| findstr "LISTENING"') do (
    echo Killing backend PID %%a ...
    taskkill /PID %%a /F >nul 2>&1
)

:: Kill frontend (vite on port 5180)
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":5180" ^| findstr "LISTENING"') do (
    echo Killing frontend PID %%a ...
    taskkill /PID %%a /F >nul 2>&1
)

echo.
echo All services stopped.
pause
