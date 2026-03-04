@echo off
echo ============================================
echo  Restarting Backend Server with Timezone Fix
echo ============================================
echo.

echo Stopping all node processes...
taskkill /F /IM node.exe 2>nul
timeout /t 2 /nobreak >nul

echo.
echo Starting backend server...
cd /d "%~dp0"
start "RMG Backend Server" cmd /k "npm run dev"

echo.
echo ============================================
echo Backend server restarted!
echo Check the new terminal window for logs.
echo ============================================
pause
