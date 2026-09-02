# One-click local preview server for the publish folder
$publish = "C:\Users\PC\OneDrive\Documents\WWW.DAWKINSBROS.COM\publish"
Set-Location -Path $publish
Write-Output "Serving: $publish"
n# Prefer Python if availablenif (Get-Command python -ErrorAction SilentlyContinue) {
  Write-Output "Starting Python http.server on http://127.0.0.1:8000/"
  Start-Process -FilePath python -ArgumentList "-m","http.server","8000","--bind","127.0.0.1" -WindowStyle Minimized
  Start-Sleep -Milliseconds 900
  Start-Process "http://127.0.0.1:8000/"
  return
}
if (Get-Command python3 -ErrorAction SilentlyContinue) {
  Write-Output "Starting Python3 http.server on http://127.0.0.1:8000/"
  Start-Process -FilePath python3 -ArgumentList "-m","http.server","8000","--bind","127.0.0.1" -WindowStyle Minimized
  Start-Sleep -Milliseconds 900
  Start-Process "http://127.0.0.1:8000/"
  return
}
n# Prefer npx/http-server if availablenif (Get-Command npx -ErrorAction SilentlyContinue) {
  Write-Output "Starting npx http-server on http://127.0.0.1:8000/"
  Start-Process -FilePath npx -ArgumentList "http-server","$publish","-p","8000","-c-1" -NoNewWindow
  Start-Sleep -Milliseconds 900
  Start-Process "http://127.0.0.1:8000/"
  return
}
n# Fallback: small HttpListener-based server (single-threaded, safe for local preview)nWrite-Output "No Python or npx found. Starting built-in PowerShell HTTP listener on http://127.0.0.1:8000/"
$prefix = "http://127.0.0.1:8000/"
$listener = New-Object System.Net.HttpListenern$listener.Prefixes.Add($prefix)
try {
  $listener.Start()
  Start-Process $prefix
  Write-Output "Serving files from $publish — press Ctrl+C in this window to stop."
  while ($listener.IsListening) {
    $context = $listener.GetContext()
    $req = $context.Request
    $localPath = $req.Url.LocalPath.TrimStart('/')
    if ([string]::IsNullOrEmpty($localPath)) { $localPath = 'index.html' }
    $filePath = Join-Path $publish $localPath
    if (-not (Test-Path $filePath)) {
      $context.Response.StatusCode = 404
      $msg = "404 - Not Found"
      $buf = [System.Text.Encoding]::UTF8.GetBytes($msg)
      $context.Response.OutputStream.Write($buf,0,$buf.Length)
      $context.Response.Close()
      continue
    }
    try {
      $bytes = [System.IO.File]::ReadAllBytes($filePath)
      $context.Response.ContentLength64 = $bytes.Length
      switch -Regex ($filePath.ToLower()) {
        '\.html$' { $context.Response.ContentType = 'text/html; charset=utf-8' }
        '\.css$'  { $context.Response.ContentType = 'text/css' }
        '\.js$'   { $context.Response.ContentType = 'application/javascript' }
        '\.png$'  { $context.Response.ContentType = 'image/png' }
        '\.webp$' { $context.Response.ContentType = 'image/webp' }
        '\.jpe?g$' { $context.Response.ContentType = 'image/jpeg' }
        '\.svg$'  { $context.Response.ContentType = 'image/svg+xml' }
        default { $context.Response.ContentType = 'application/octet-stream' }
      }
      $context.Response.OutputStream.Write($bytes,0,$bytes.Length)
      $context.Response.Close()
    } catch {
      $context.Response.StatusCode = 500
      $msg = "500 - Server error"
      $buf = [System.Text.Encoding]::UTF8.GetBytes($msg)
      $context.Response.OutputStream.Write($buf,0,$buf.Length)
      $context.Response.Close()
    }
  }
} finally {
  if ($listener -and $listener.IsListening) { $listener.Stop() }
}
