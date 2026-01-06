@echo off
echo Initializing Git Repository...
git init
echo.
echo Adding all files...
git add .
echo.
echo Committing files...
git commit -m "Initial commit: RealField Pro v1.0 - Core Features & AI Setup"
echo.
echo ==========================================
echo Git Repository Initialized Successfully!
echo ==========================================
echo.
echo To push to GitHub, run:
echo git remote add origin https://github.com/YOUR_USERNAME/realfield-pro.git
echo git branch -M main
echo git push -u origin main
echo.
pause
