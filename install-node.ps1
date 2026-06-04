# PowerShell script to download and install Node.js LTS via MSI

$msiUrl = "https://nodejs.org/dist/v22.12.0/node-v22.12.0-x64.msi"
$tempPath = "$env:TEMP\node-setup.msi"

Write-Host "Downloading Node.js LTS MSI installer from: $msiUrl" -ForegroundColor Cyan
try {
    Invoke-WebRequest -Uri $msiUrl -OutFile $tempPath -UserAgent "Mozilla/5.0"
    Write-Host "Download successful! Saved to $tempPath" -ForegroundColor Green
} catch {
    Write-Error "Failed to download Node.js installer: $_"
    exit 1
}

Write-Host "Launching Node.js installer..." -ForegroundColor Cyan
Write-Host "Please complete the setup in the window that opens." -ForegroundColor Yellow
Start-Process msiexec.exe -ArgumentList "/i `"$tempPath`"" -Wait

Write-Host "Node.js installation finished!" -ForegroundColor Green
Write-Host "IMPORTANT: Please restart your terminal/IDE to apply the new PATH environment variables." -ForegroundColor Yellow
