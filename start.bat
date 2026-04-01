@echo off
title AI Professor Agent - Launcher
color 0A

echo ============================================
echo    AI Professor Agent - One-Click Launcher
echo ============================================
echo.

:: Check Python
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Python is not installed or not in PATH.
    echo Download from: https://www.python.org/downloads/
    echo IMPORTANT: Check "Add Python to PATH" during installation!
    pause
    exit /b 1
)
echo [OK] Python found.

:: Check Ollama
ollama --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Ollama is not installed.
    echo Download from: https://ollama.com/download
    pause
    exit /b 1
)
echo [OK] Ollama found.

:: Check if phi3 model is pulled
echo.
echo Checking for phi3 model...
ollama list 2>nul | findstr /i "phi3" >nul
if %errorlevel% neq 0 (
    echo [INFO] phi3 model not found. Downloading now...
    echo This may take 5-10 minutes depending on your internet speed.
    ollama pull phi3
    if %errorlevel% neq 0 (
        echo [ERROR] Failed to download phi3 model.
        pause
        exit /b 1
    )
)
echo [OK] phi3 model ready.

:: Create virtual environment if it doesn't exist
if not exist "venv" (
    echo.
    echo Creating virtual environment...
    python -m venv venv
    if %errorlevel% neq 0 (
        echo [ERROR] Failed to create virtual environment.
        pause
        exit /b 1
    )
    echo [OK] Virtual environment created.
)

:: Activate virtual environment and install dependencies
echo.
echo Activating virtual environment and checking dependencies...
call venv\Scripts\activate.bat

pip install -r requirements.txt -q
if %errorlevel% neq 0 (
    echo [ERROR] Failed to install dependencies.
    pause
    exit /b 1
)
echo [OK] All dependencies installed.

:: Create data directories if they don't exist
if not exist "data\uploads" mkdir data\uploads
if not exist "data\chroma" mkdir data\chroma

echo.
echo ============================================
echo    Starting AI Professor Agent...
echo ============================================
echo.
echo Backend  : http://localhost:8000
echo API Docs : http://localhost:8000/docs
echo Frontend : http://localhost:8501
echo.
echo Press Ctrl+C in this window to stop both servers.
echo ============================================
echo.

:: Start backend in background
start "AI Professor - Backend" /min cmd /c "call venv\Scripts\activate.bat && python -m uvicorn backend.main:app --port 8000"

:: Wait for backend to start
echo Waiting for backend to start...
timeout /t 4 /nobreak >nul

:: Start frontend (this keeps the window open)
echo Starting frontend...
call venv\Scripts\activate.bat
streamlit run frontend/app.py --server.port 8501
