# start-ghosttrack.ps1 - Complete GhostTrack startup script

Write-Host "🚀 Starting GhostTrack Analytics..." -ForegroundColor Cyan

# Navigate to project
cd C:\Users\ktkka\PycharmProjects\GhostTrack-Analytics

Write-Host "✅ Activating virtual environment..." -ForegroundColor Green
.\backend\venv\Scripts\Activate.ps1

Write-Host "✅ Starting backend server..." -ForegroundColor Green
cd backend
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd C:\Users\ktkka\PycharmProjects\GhostTrack-Analytics\backend; .\venv\Scripts\Activate.ps1; uvicorn app.main:app --reload"

Write-Host "✅ Backend running at http://localhost:8000" -ForegroundColor Green
Write-Host "✅ Test dashboard at http://localhost:8000/test" -ForegroundColor Green
Write-Host "✅ API docs at http://localhost:8000/docs" -ForegroundColor Green

Write-Host "`n🎉 GhostTrack is ready!" -ForegroundColor Cyan