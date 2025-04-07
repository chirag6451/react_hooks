@echo off
echo ===================================================
echo  React Build Hooks - One-Click Installer
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

:: Create a temporary directory for the hooks
set temp_dir=%TEMP%\react-hooks-%RANDOM%
echo Creating temporary directory: %temp_dir%
mkdir "%temp_dir%"
cd /d "%temp_dir%"

:: Clone the repository
echo Cloning React Build Hooks repository...
git clone https://github.com/chirag6451/react_hooks.git .

if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Failed to clone repository.
    cd /d "%OLDPWD%"
    rmdir /s /q "%temp_dir%"
    exit /b 1
)

:: Get the original directory
for /f "tokens=*" %%a in ('cd') do set original_dir=%%a

:: Run the install script
echo Running installation script...
call install-windows.bat

:: Clean up
echo Cleaning up temporary files...
cd /d "%original_dir%"
rmdir /s /q "%temp_dir%"

echo.
echo ===================================================
echo  One-Click Installation Complete!
echo ===================================================
echo.
echo The Git hooks have been installed in your project.
echo.
pause
