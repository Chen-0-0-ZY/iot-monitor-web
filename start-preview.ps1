Set-Location "d:\trae_test\temp-backup"
$env:Path = "C:\Program Files\nodejs;$env:Path"
Write-Host "Starting preview server..."
Write-Host "Open http://localhost:3000/iot-monitor-web/ in your browser"
Write-Host ""
node serve.js
