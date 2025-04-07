# React Build Hooks - One-Click PowerShell Installer
Write-Host "===================================================" -ForegroundColor Cyan
Write-Host " React Build Hooks - One-Click PowerShell Installer" -ForegroundColor Cyan
Write-Host "===================================================" -ForegroundColor Cyan
Write-Host ""

# Check if running as administrator
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
    Write-Host "NOTE: Some operations may require administrator privileges." -ForegroundColor Yellow
    Write-Host "If you encounter permission issues, try running this script as administrator." -ForegroundColor Yellow
    Write-Host ""
}

# Check if Node.js is installed
try {
    $nodeVersion = node -v
    Write-Host "✓ Node.js detected: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "ERROR: Node.js is not installed or not in PATH." -ForegroundColor Red
    Write-Host "Please install Node.js from https://nodejs.org/" -ForegroundColor Red
    exit 1
}

# Check if Git is installed
try {
    $gitVersion = git --version
    Write-Host "✓ Git detected: $gitVersion" -ForegroundColor Green
} catch {
    Write-Host "ERROR: Git is not installed or not in PATH." -ForegroundColor Red
    Write-Host "Please install Git from https://git-scm.com/" -ForegroundColor Red
    exit 1
}

# Check if running in a Git repository
try {
    $null = git rev-parse --is-inside-work-tree
    Write-Host "✓ Git repository detected" -ForegroundColor Green
} catch {
    Write-Host "ERROR: Not in a Git repository." -ForegroundColor Red
    Write-Host "Please run this script from within a Git repository." -ForegroundColor Red
    exit 1
}

# Check if package.json exists
if (-not (Test-Path "package.json")) {
    Write-Host "ERROR: No package.json found." -ForegroundColor Red
    Write-Host "Please run this script from the root of a Node.js project." -ForegroundColor Red
    exit 1
}
Write-Host "✓ package.json detected" -ForegroundColor Green

# Create a temporary directory for the hooks
$tempDir = Join-Path $env:TEMP "react-hooks-$(Get-Random)"
Write-Host "`nCreating temporary directory: $tempDir" -ForegroundColor Cyan
New-Item -ItemType Directory -Path $tempDir | Out-Null
Push-Location $tempDir

# Clone the repository
Write-Host "Cloning React Build Hooks repository..." -ForegroundColor Cyan
try {
    git clone https://github.com/chirag6451/react_hooks.git .
    Write-Host "✓ Repository cloned successfully" -ForegroundColor Green
} catch {
    Write-Host "ERROR: Failed to clone repository." -ForegroundColor Red
    Pop-Location
    Remove-Item -Path $tempDir -Recurse -Force
    exit 1
}

# Get the original directory
$originalDir = $pwd

# Run the install script
Write-Host "`nRunning installation script..." -ForegroundColor Cyan
try {
    # Copy the necessary files to the original project
    Copy-Item -Path "scripts\build-react-apps.js" -Destination "$originalDir\scripts\build-react-apps.js" -Force -Recurse
    Copy-Item -Path "scripts\check-gitignore.js" -Destination "$originalDir\scripts\check-gitignore.js" -Force -Recurse
    Copy-Item -Path "scripts\update-package-json.js" -Destination "$originalDir\scripts\update-package-json.js" -Force -Recurse
    
    # Run the installation script from the original project directory
    & "$tempDir\install-windows.ps1"
} catch {
    Write-Host "ERROR: Installation failed." -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
}

# Clean up
Write-Host "`nCleaning up temporary files..." -ForegroundColor Cyan
Pop-Location
Remove-Item -Path $tempDir -Recurse -Force
Write-Host "✓ Cleanup complete" -ForegroundColor Green

Write-Host "`n===================================================" -ForegroundColor Green
Write-Host " One-Click Installation Complete!" -ForegroundColor Green
Write-Host "===================================================" -ForegroundColor Green
Write-Host "`nThe Git hooks have been installed in your project." -ForegroundColor White
Write-Host ""

Write-Host "Press any key to exit..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
