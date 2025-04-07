#!/bin/bash

# React Build Git Hooks Uninstaller
# This script uninstalls the React Build Git Hooks from your project

echo "🔧 React Build Git Hooks Uninstaller"
echo "======================================"

# Check if git is initialized
if ! git rev-parse --is-inside-work-tree > /dev/null 2>&1; then
    echo "❌ ERROR: This directory is not a Git repository."
    echo "Please run this script from a Git repository."
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ ERROR: Node.js is not installed or not in PATH."
    exit 1
fi

# Ask for confirmation
read -p "⚠️ This will remove all Git hooks set up by React Build Git Hooks. Are you sure? (y/n): " confirm
if [[ "$confirm" != "y" && "$confirm" != "Y" && "$confirm" != "yes" && "$confirm" != "Yes" ]]; then
    echo "Uninstallation cancelled."
    exit 0
fi

# Remove hooks
echo -e "\n🔄 Removing Git hooks..."
hooks_removed=0

for hook in "pre-commit" "pre-push"; do
    if [ -f ".husky/$hook" ]; then
        # Check if it's our hook
        if grep -q "check-gitignore\|build:dev" ".husky/$hook"; then
            rm -f ".husky/$hook"
            echo "✅ Removed $hook hook"
            hooks_removed=$((hooks_removed + 1))
        else
            echo "ℹ️ Skipped $hook hook as it appears to be custom"
        fi
    fi
done

# Update package.json to remove our scripts
if [ -f "package.json" ]; then
    echo -e "\n🔄 Updating package.json..."
    
    # Create a temporary file for the new package.json
    tmp_file=$(mktemp)
    
    # Use node to modify package.json
    node -e "
        const fs = require('fs');
        const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
        let modified = false;
        
        if (packageJson.scripts) {
            if (packageJson.scripts['check-gitignore']) {
                delete packageJson.scripts['check-gitignore'];
                modified = true;
            }
            
            if (packageJson.scripts['build:dev']) {
                delete packageJson.scripts['build:dev'];
                modified = true;
            }
        }
        
        fs.writeFileSync('$tmp_file', JSON.stringify(packageJson, null, 2));
        process.exit(modified ? 0 : 1);
    " && {
        mv "$tmp_file" "package.json"
        echo "✅ Removed scripts from package.json"
    } || {
        rm "$tmp_file"
        echo "ℹ️ No scripts to remove from package.json"
    }
fi

# Remove script files
echo -e "\n🔄 Removing script files..."
files_removed=0

for file in "scripts/build-react-apps.js" "scripts/check-gitignore.js"; do
    if [ -f "$file" ]; then
        rm -f "$file"
        echo "✅ Removed $file"
        files_removed=$((files_removed + 1))
    fi
done

# Check if scripts directory is empty and remove it if it is
if [ -d "scripts" ] && [ -z "$(ls -A scripts)" ]; then
    rmdir "scripts"
    echo "✅ Removed empty scripts directory"
fi

if [ "$hooks_removed" -gt 0 ] || [ "$files_removed" -gt 0 ]; then
    echo -e "\n🎉 Successfully uninstalled React Build Git Hooks!"
else
    echo -e "\nℹ️ No hooks or files were found to uninstall."
fi

echo -e "\nIf you want to completely remove Husky as well, you can run:"
echo "npm uninstall husky"
