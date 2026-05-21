$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add('http://localhost:3000/')
try {
    $listener.Start()
    Write-Host "服务器已启动在 http://localhost:3000/"
    Write-Host "按 Ctrl+C 停止服务器..."
    while ($listener.IsListening) {
        Start-Sleep -Milliseconds 1000
    }
} catch {
    Write-Host "启动服务器失败: $_"
} finally {
    if ($listener.IsListening) {
        $listener.Stop()
    }
}