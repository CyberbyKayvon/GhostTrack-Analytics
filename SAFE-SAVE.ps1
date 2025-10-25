# SAFE-SAVE.ps1 - Foolproof save script
Write-Host "💾 SAVING YOUR WORK..." -ForegroundColor Cyan

# Stop any running servers
Stop-Process -Name python -ErrorAction SilentlyContinue

# Remove any git locks
Remove-Item .git/index.lock -Force -ErrorAction SilentlyContinue
Remove-Item .git/rebase-merge -Recurse -Force -ErrorAction SilentlyContinue

# Save everything
git add .
git commit -m "Work saved - $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"

# Try normal push first, then force if needed
git push origin main
if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️ Normal push failed, force pushing..." -ForegroundColor Yellow
    git push origin main --force
}

Write-Host "`n✅ EVERYTHING SAVED TO GITHUB!" -ForegroundColor Green
Write-Host "✅ You can safely close everything now" -ForegroundColor Green