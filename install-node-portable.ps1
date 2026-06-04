# PowerShell script to download and set up a portable (non-admin) version of Node.js LTS

$zipUrl = "https://nodejs.org/dist/v22.12.0/node-v22.12.0-win-x64.zip"
$destDir = "c:\Users\Public\Ravi Devlopment\node-portable"
$zipPath = "$env:TEMP\node-portable.zip"

Write-Host "Downloading portable Node.js LTS from: $zipUrl" -ForegroundColor Cyan
try {
    Invoke-WebRequest -Uri $zipUrl -OutFile $zipPath -UserAgent "Mozilla/5.0"
    Write-Host "Download successful!" -ForegroundColor Green
} catch {
    Write-Error "Failed to download Node.js: $_"
    exit 1
}

Write-Host "Extracting to: $destDir" -ForegroundColor Cyan
if (Test-Path $destDir) {
    Remove-Item -Recurse -Force $destDir
}
New-Item -ItemType Directory -Path $destDir -Force | Out-Null

try {
    Expand-Archive -Path $zipPath -DestinationPath $destDir -Force
    # Move files up one level if they are nested in a subfolder
    $subDir = Get-ChildItem -Path $destDir -Directory | Select-Object -First 1
    if ($subDir) {
        Move-Item -Path "$($subDir.FullName)\*" -Destination $destDir -Force
        Remove-Item -Path $subDir.FullName -Recurse -Force
    }
    Write-Host "Extraction complete!" -ForegroundColor Green
} catch {
    Write-Error "Failed to extract archive: $_"
    exit 1
}

Write-Host "Node.js portable installation finished!" -ForegroundColor Green
Write-Host ""
Write-Host "To use this portable version in your current PowerShell terminal, run:" -ForegroundColor Yellow
Write-Host "  `$env:PATH = `"$destDir;`" + `$env:PATH" -ForegroundColor Cyan
Write-Host "  node -v" -ForegroundColor Cyan
