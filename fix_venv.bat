@echo off
echo ==========================================
echo    FIXING BROKEN PYTHON ENVIRONMENT
echo ==========================================
echo.

cd /d "%~dp0"
cd Dyslexia

if exist "venv" (
    echo [1/4] Deleting broken 'venv' folder...
    rmdir /s /q "venv"
)

echo [2/4] Creating new virtual environment...
python -m venv venv

echo [3/4] Activating environment...
call venv\Scripts\activate

echo [4/4] Installing dependencies...
echo (This may take a few minutes)
pip install transformers torch requests nltk

echo.
echo ==========================================
echo           SETUP COMPLETE!
echo ==========================================
echo.
echo Please restart your backend server now:
echo 1. Close current node window
echo 2. Run 'node index.js' again
echo.
pause
