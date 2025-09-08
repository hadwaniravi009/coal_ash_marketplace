@echo off
echo ================================================================
echo             AshLink - Coal Ash Marketplace
echo                GitHub Push Script
echo ================================================================
echo.

echo Step 1: Checking Git status...
git status
echo.

echo Step 2: Adding all files to staging...
git add .
echo.

echo Step 3: Committing changes...
git commit -m "Initial commit: Coal Ash Marketplace with enhanced UI"
echo.

echo Step 4: Setting up remote origin (if not already set)...
git remote remove origin 2>nul
git remote add origin https://github.com/hadwaniravi009/coal_ash_marketplace.git
echo.

echo Step 5: Pushing to GitHub...
git push -u origin main
echo.

echo ================================================================
echo                    Push Complete!
echo ================================================================
echo.
echo Your project has been pushed to:
echo https://github.com/hadwaniravi009/coal_ash_marketplace
echo.
echo Next steps:
echo 1. Visit the GitHub repository
echo 2. Verify all files are uploaded
echo 3. Update README.md if needed
echo 4. Set up GitHub Pages (optional)
echo.
pause
