Set-Location "d:\trae_test\temp-backup"
$env:Path = "C:\Program Files\nodejs;$env:Path"
Write-Host "Building TypeScript..."
& "C:\Program Files\nodejs\node.exe" node_modules/typescript/bin/tsc 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "TypeScript compilation failed"
    exit 1
}

Write-Host "Building with Vite..."
& "C:\Program Files\nodejs\node.exe" node_modules/vite/bin/vite.js build 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "Build successful!"
} else {
    Write-Host "Vite build failed"
    exit 1
}
