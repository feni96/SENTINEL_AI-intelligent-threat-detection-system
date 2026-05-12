@echo off
echo ========================================
echo Sentinel AI - System Restart Script
echo ========================================
echo.

echo Step 1: Cleaning Vite cache...
cd frontend
if exist .vite rmdir /s /q .vite
if exist node_modules\.vite rmdir /s /q node_modules\.vite
echo ✓ Vite cache cleared
echo.

echo Step 2: Instructions for restarting services
echo.
echo Please open TWO separate command prompts and run:
echo.
echo Terminal 1 - Backend:
echo   cd backend
echo   node server.js
echo.
echo Terminal 2 - Frontend:
echo   cd frontend
echo   npm run dev
echo.
echo Then open your browser to: http://localhost:5173/
echo.
echo ========================================
echo Press any key to exit...
pause >nul
