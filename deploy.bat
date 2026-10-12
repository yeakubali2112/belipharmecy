@echo off
title Beli Pharmacy - One-Click Deploy
echo ========================================================
echo       Deploying Beli Pharmacy to Vercel Production
echo ========================================================
echo.

echo [1/3] Saving latest changes to Git...
git add .
git commit -m "Auto update: %date% %time%"

echo.
echo [2/3] Checking GitHub sync...
git remote get-url origin >nul 2>&1
if %errorlevel% equ 0 (
    echo Pushing changes to GitHub repository...
    git push origin main
) else (
    echo (GitHub remote not configured yet - will deploy directly to Vercel)
)

echo.
echo [3/3] Deploying to Vercel Production...
call npx vercel --prod --yes

echo.
echo ========================================================
echo   Deployment Complete!
echo   Live Website: https://belipharmecy.vercel.app
echo ========================================================
echo.
pause
