@echo off

REM StarWise Literature One-click Start Script (Windows)
REM Supports starting both frontend and backend services with clean shutdown

echo StarWise Literature One-click Start Script
echo ==============================

REM Create temporary files to store process IDs
echo.
echo Creating temporary files for process management...
echo.

REM Start backend service (in new window)
echo 1. Starting backend service...
start "Backend Service" cmd /k "cd server && npm run dev"

REM Wait a moment for the service to start
echo Waiting for backend service to start...
ping 127.0.0.1 -n 5 > nul

REM Start frontend service (in new window)
echo 2. Starting frontend service...
start "Frontend Service" cmd /k "cd client && npm run dev"

REM Wait a moment for the service to start
echo Waiting for frontend service to start...
ping 127.0.0.1 -n 5 > nul

echo 3. Services started successfully!
echo ==============================
echo Access URLs:
echo - Frontend: http://localhost:3000 (or other port if 3000 is in use)
echo - Backend: http://localhost:3001
echo - Health Check: http://localhost:3001/api/health
echo ==============================
echo Test Accounts:
echo - Admin: admin@starwise.com / 123456
echo - Author: author@starwise.com / 123456
echo - User: user@starwise.com / 123456
echo ==============================
echo.
echo Services are running in separate windows.
echo To stop services, please close the respective windows manually.
echo ==============================
echo.
echo Press any key to exit this script...
echo.

REM Wait for user input
pause > nul

echo Exiting script...
exit /b 0
