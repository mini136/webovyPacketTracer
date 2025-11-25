# Start Network Simulator

Write-Host "🚀 Starting Network Simulator..." -ForegroundColor Green

# Check if MongoDB is running
Write-Host "`n📊 Checking MongoDB..." -ForegroundColor Yellow
$mongoRunning = $false

try {
    $mongoService = Get-Service -Name "MongoDB" -ErrorAction SilentlyContinue
    if ($mongoService -and $mongoService.Status -eq "Running") {
        Write-Host "✅ MongoDB is running" -ForegroundColor Green
        $mongoRunning = $true
    }
}
catch {}

if (-not $mongoRunning) {
    Write-Host "⚠️  MongoDB is not running!" -ForegroundColor Red
    Write-Host "   Please start MongoDB or use Docker:" -ForegroundColor Yellow
    Write-Host "   docker run -d -p 27017:27017 --name mongodb mongo:latest" -ForegroundColor Cyan
    Write-Host "`n   Or see MONGODB_SETUP.md for installation instructions" -ForegroundColor Yellow
    $continue = Read-Host "`nContinue anyway? (y/n)"
    if ($continue -ne "y") {
        exit
    }
}

# Start Backend
Write-Host "`n🔧 Starting Backend..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\backend'; npm run start:dev"

# Wait a bit for backend to start
Start-Sleep -Seconds 3

# Start Frontend
Write-Host "🎨 Starting Frontend..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\frontend'; npm run dev"

Write-Host "`n✨ Done! Applications are starting..." -ForegroundColor Green
Write-Host "   Backend:  http://localhost:3000" -ForegroundColor Cyan
Write-Host "   Frontend: http://localhost:5173" -ForegroundColor Cyan
Write-Host "`nPress any key to exit this window..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
