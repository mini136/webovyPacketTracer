# Playwright Setup Script
# Spustí instalaci Playwright browsers

Write-Host "🎭 Playwright Setup" -ForegroundColor Cyan
Write-Host "==================" -ForegroundColor Cyan
Write-Host ""

Write-Host "📦 Instaluji Chromium browser pro Playwright..." -ForegroundColor Yellow
npx playwright install chromium

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Playwright setup dokončen!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Můžeš spustit testy pomocí:" -ForegroundColor Cyan
    Write-Host "  npm test              # Headless mode" -ForegroundColor White
    Write-Host "  npm run test:ui       # Interaktivní UI" -ForegroundColor White
    Write-Host "  npm run test:headed   # S viditelným prohlížečem" -ForegroundColor White
    Write-Host "  npm run test:debug    # Debug mode" -ForegroundColor White
    Write-Host ""
}
else {
    Write-Host ""
    Write-Host "❌ Chyba při instalaci Playwright" -ForegroundColor Red
    Write-Host ""
}
