@echo off
echo Restarting JavaRanker server...
cd /d "c:\Users\sakib\Downloads\echo-forge"
taskkill /f /im node.exe 2>nul
timeout /t 2 /nobreak >nul
echo Starting server...
start "JavaRanker Server" cmd /k "npm run dev"
echo Server restart initiated!
pause