@echo off
title AcadAI - Launcher
color 0A

echo ============================================
echo       AcadAI - One-Click Launcher
echo ============================================
echo.

:: Check Python
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Python is not installed or not in PATH.
    pause
    exit /b 1
)
echo [OK] Python found.

:: Check Node.js
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed.
    echo Download from: https://nodejs.org/
    pause
    exit /b 1
)
echo [OK] Node.js found.

:: Check Ollama
ollama --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Ollama is not installed.
    echo Download from: https://ollama.com/download
    pause
    exit /b 1
)
echo [OK] Ollama found.

:: Check phi3 model
ollama list 2>nul | findstr /i "phi3" >nul
if %errorlevel% neq 0 (
    echo [INFO] Downloading phi3 model (5-10 minutes)...
    ollama pull phi3
)
echo [OK] phi3 model ready.

:: Create data directories
if not exist "data\uploads" mkdir data\uploads
if not exist "data\chroma" mkdir data\chroma

echo.
echo ============================================
echo       Starting AcadAI Services...
echo ============================================
echo.
echo Backend  : http://localhost:8000
echo Frontend : http://localhost:3000
echo API Docs : http://localhost:8000/docs
echo.
echo Close this window to stop all services.
echo ============================================
echo.

:: Start backend
start "AcadAI - Backend" cmd /c "call venv\Scripts\activate.bat && python -m uvicorn backend.main:app --port 8000"

:: Wait for backend
timeout /t 3 /nobreak >nul

:: Start React frontend
cd frontend-react
start "AcadAI - Frontend" cmd /c "npm run dev"

:: Open browser after a short delay
timeout /t 4 /nobreak >nul
start http://localhost:3000

echo.
echo AcadAI is running! Browser should open automatically.
echo Press any key to stop all services...
pause >nul

:: Cleanup - kill the processes
taskkill /FI "WINDOWTITLE eq AcadAI - Backend" /F >nul 2>&1
taskkill /FI "WINDOWTITLE eq AcadAI - Frontend" /F >nul 2>&1
