# AshLink - Coal Ash Marketplace GitHub Push Script
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host "             AshLink - Coal Ash Marketplace" -ForegroundColor Yellow
Write-Host "                GitHub Push Script" -ForegroundColor Yellow
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host ""

try {
    Write-Host "Step 1: Checking Git status..." -ForegroundColor Green
    git status
    Write-Host ""

    Write-Host "Step 2: Adding all files to staging..." -ForegroundColor Green
    git add .
    Write-Host ""

    Write-Host "Step 3: Committing changes..." -ForegroundColor Green
    git commit -m "Initial commit: Coal Ash Marketplace with enhanced UI and modern design"
    Write-Host ""

    Write-Host "Step 4: Setting up remote origin..." -ForegroundColor Green
    git remote remove origin 2>$null
    git remote add origin https://github.com/hadwaniravi009/coal_ash_marketplace.git
    Write-Host ""

    Write-Host "Step 5: Pushing to GitHub..." -ForegroundColor Green
    git push -u origin main
    Write-Host ""

    Write-Host "================================================================" -ForegroundColor Cyan
    Write-Host "                    Push Complete!" -ForegroundColor Green
    Write-Host "================================================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Your project has been pushed to:" -ForegroundColor Yellow
    Write-Host "https://github.com/hadwaniravi009/coal_ash_marketplace" -ForegroundColor Blue
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Yellow
    Write-Host "1. Visit the GitHub repository" -ForegroundColor White
    Write-Host "2. Verify all files are uploaded" -ForegroundColor White
    Write-Host "3. Update repository description and topics" -ForegroundColor White
    Write-Host "4. Set up GitHub Pages for documentation (optional)" -ForegroundColor White
    Write-Host ""
}
catch {
    Write-Host "Error occurred: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Please check your Git configuration and GitHub repository settings." -ForegroundColor Yellow
}

Read-Host "Press Enter to continue..."
