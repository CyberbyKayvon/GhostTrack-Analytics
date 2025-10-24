# quick-save.ps1
Write-Host "💾 Saving all changes..." -ForegroundColor Cyan

git add .
git commit -m "Work in progress - $(Get-Date -Format 'yyyy-MM-dd HH:mm')"

Write-Host "✅ Everything saved!" -ForegroundColor Green
Write-Host ""
git log --oneline -5