@echo off
title Beli Pharmacy - Pull Latest Updates
echo ========================================================
echo       Pulling Latest Updates from GitHub
echo ========================================================
echo.

git remote get-url origin >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] GitHub remote not connected yet.
    echo Please link your GitHub repository first.
    echo.
    pause
    exit /b
)

echo Syncing latest code from GitHub...
git pull origin main

echo.
echo ========================================================
echo   Sync Complete! Your project is up to date.
echo ========================================================
echo.
pause
