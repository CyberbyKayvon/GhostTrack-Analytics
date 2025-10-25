# SAFE-SAVE.ps1 - Foolproof save script
Write-Host "💾 SAVING YOUR WORK..." -ForegroundColor Cyan

# Stop any running servers
Stop-Process -Name python -ErrorAction SilentlyContinue

# Remove any git locks
Remove-Item .git/index.lock -Force -ErrorAction SilentlyContinue
Remove-Item .git/rebase-merge -Recurse -Force -ErrorAction SilentlyContinue

# Show what will be saved
Write-Host "
📋 Files to be saved:" -ForegroundColor Yellow
git status --short

# Ask for confirmation
$confirm = Read-Host "
Does this look correct? (yes/no)"
if ($confirm -ne "yes") {
    Write-Host "❌ Save cancelled" -ForegroundColor Red
    exit
}

# Save everything
git add .
git commit -m "Work saved - $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
git push origin main

Write-Host "
✅ EVERYTHING SAVED TO GITHUB!" -ForegroundColor Green
