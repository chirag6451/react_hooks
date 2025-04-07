@echo off
echo ===================================================
echo  React Build Hooks - Windows Installer
echo ===================================================
echo.

:: Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Node.js is not installed or not in PATH.
    echo Please install Node.js from https://nodejs.org/
    exit /b 1
)

:: Check if Git is installed
where git >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Git is not installed or not in PATH.
    echo Please install Git from https://git-scm.com/
    exit /b 1
)

:: Check if running in a Git repository
git rev-parse --is-inside-work-tree >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Not in a Git repository.
    echo Please run this script from within a Git repository.
    exit /b 1
)

:: Check if package.json exists
if not exist package.json (
    echo ERROR: No package.json found.
    echo Please run this script from the root of a Node.js project.
    exit /b 1
)

echo Installing Husky...
call npm install husky --save-dev

:: Create scripts directory if it doesn't exist
if not exist scripts mkdir scripts

:: Copy the scripts
echo Copying build and gitignore check scripts...
copy /Y "%~dp0scripts\build-react-apps.js" "scripts\build-react-apps.js"
copy /Y "%~dp0scripts\check-gitignore.js" "scripts\check-gitignore.js"

:: Update package.json to add scripts
echo Updating package.json...
node "%~dp0scripts\update-package-json.js" "%CD%\package.json"

:: Initialize Husky
echo Initializing Husky...
call npx husky install

:: Ask which hook to use
echo.
echo Which hook would you like to use?
echo 1. pre-commit (runs before each commit)
echo 2. pre-push (runs before each push)
set /p hook_choice="Enter 1 or 2: "

if "%hook_choice%"=="2" (
    set hook_type=pre-push
) else (
    set hook_type=pre-commit
)

:: Create the hook script
echo Creating %hook_type% hook...
if not exist .husky mkdir .husky
(
    echo #!/bin/sh
    echo . "$(dirname "$0")/_/husky.sh"
    echo.
    echo # Check .gitignore for sensitive files
    echo npm run check-gitignore
    echo.
    echo # Run build for React apps
    echo npm run build:dev
) > ".husky\%hook_type%"

:: Make the hook executable (for WSL or Git Bash)
echo Making hook executable...
git update-index --chmod=+x ".husky/%hook_type%"

echo.
echo ===================================================
echo  Installation Complete!
echo ===================================================
echo.
echo The Git hook will now:
echo 1. Check and update .gitignore for sensitive files
echo 2. Enforce building React apps
echo.
echo These checks will run before each %hook_type:pre-=%
echo.
echo To distribute to your team, they just need to run:
echo   npm install
echo.
pause
