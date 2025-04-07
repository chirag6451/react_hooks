# React Build Hooks - PowerShell Installer
Write-Host "===================================================" -ForegroundColor Cyan
Write-Host " React Build Hooks - PowerShell Installer" -ForegroundColor Cyan
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

# Install Husky
Write-Host "`nInstalling Husky..." -ForegroundColor Cyan
npm install husky --save-dev

# Create scripts directory if it doesn't exist
if (-not (Test-Path "scripts")) {
    New-Item -ItemType Directory -Path "scripts" | Out-Null
    Write-Host "✓ Created scripts directory" -ForegroundColor Green
}

# Copy the scripts
Write-Host "`nCopying build and gitignore check scripts..." -ForegroundColor Cyan
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Copy-Item -Path "$scriptDir\scripts\build-react-apps.js" -Destination "scripts\build-react-apps.js" -Force
Copy-Item -Path "$scriptDir\scripts\check-gitignore.js" -Destination "scripts\check-gitignore.js" -Force
Write-Host "✓ Scripts copied successfully" -ForegroundColor Green

# Update package.json to add scripts
Write-Host "`nUpdating package.json..." -ForegroundColor Cyan
node "$scriptDir\scripts\update-package-json.js" "$(Get-Location)\package.json"

# Initialize Husky
Write-Host "`nInitializing Husky..." -ForegroundColor Cyan
npx husky install

# Ask which hook to use
Write-Host "`nWhich hook would you like to use?" -ForegroundColor Cyan
Write-Host "1. pre-commit (runs before each commit)" -ForegroundColor White
Write-Host "2. pre-push (runs before each push)" -ForegroundColor White
$hookChoice = Read-Host "Enter 1 or 2"

if ($hookChoice -eq "2") {
    $hookType = "pre-push"
} else {
    $hookType = "pre-commit"
}

# Create the hook script
Write-Host "`nCreating $hookType hook..." -ForegroundColor Cyan
if (-not (Test-Path ".husky")) {
    New-Item -ItemType Directory -Path ".husky" | Out-Null
}

$hookContent = @"
#!/bin/sh
. "`$(dirname "`$0")/_/husky.sh"

# Check .gitignore for sensitive files
npm run check-gitignore

# Run build for React apps
npm run build:dev
"@

Set-Content -Path ".husky\$hookType" -Value $hookContent

# Make the hook executable (for WSL or Git Bash)
Write-Host "Making hook executable..." -ForegroundColor Cyan
git update-index --chmod=+x ".husky/$hookType"

Write-Host "`n===================================================" -ForegroundColor Green
Write-Host " Installation Complete!" -ForegroundColor Green
Write-Host "===================================================" -ForegroundColor Green
Write-Host "`nThe Git hook will now:" -ForegroundColor White
Write-Host "1. Check and update .gitignore for sensitive files" -ForegroundColor White
Write-Host "2. Enforce building React apps" -ForegroundColor White
Write-Host "`nThese checks will run before each $($hookType -replace 'pre-', '')" -ForegroundColor White
Write-Host "`nTo distribute to your team, they just need to run:" -ForegroundColor White
Write-Host "  npm install" -ForegroundColor Cyan
Write-Host ""

Write-Host "Press any key to exit..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
