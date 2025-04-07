#!/bin/bash

# React Build Git Hooks Updater
# This script updates the React Build Git Hooks to the latest version

echo "🔄 React Build Git Hooks Updater"
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

# Create a temporary directory for the update
temp_dir=$(mktemp -d)
echo -e "\n📥 Downloading the latest version..."

# Clone the latest version
if ! git clone https://github.com/chirag6451/react_hooks.git "$temp_dir"; then
    echo "❌ Failed to download the latest version."
    rm -rf "$temp_dir"
    exit 1
fi

# Check which hook type is currently used
current_hook_type="pre-commit"
if [ -f ".husky/pre-push" ]; then
    current_hook_type="pre-push"
fi

echo -e "\n🔍 Detected $current_hook_type hook in use."

# Update the scripts
echo -e "\n📝 Updating scripts..."

# Create scripts directory if it doesn't exist
mkdir -p scripts

# Check if we're using ES modules
is_esm=false
if [ -f "package.json" ] && grep -q '"type": "module"' package.json; then
    is_esm=true
    echo "📦 Detected ES modules project"
fi

# Copy and potentially convert the scripts
if [ "$is_esm" = true ]; then
    # Convert check-gitignore.js to ES modules
    sed -e 's/const { execSync } = require(["\x27]child_process["\x27]);/import { execSync } from "child_process";/g' \
        -e 's/const fs = require(["\x27]fs["\x27]);/import fs from "fs";/g' \
        -e 's/const path = require(["\x27]path["\x27]);/import path from "path";/g' \
        "$temp_dir/scripts/check-gitignore.js" > "scripts/check-gitignore.js"
    
    # Convert build-react-apps.js to ES modules
    sed -e 's/const { execSync } = require(["\x27]child_process["\x27]);/import { execSync } from "child_process";/g' \
        -e 's/const fs = require(["\x27]fs["\x27]);/import fs from "fs";/g' \
        -e 's/const path = require(["\x27]path["\x27]);/import path from "path";/g' \
        "$temp_dir/scripts/build-react-apps.js" > "scripts/build-react-apps.js"
    
    # Convert check-lowercase.js to ES modules
    sed -e 's/const { execSync } = require(["\x27]child_process["\x27]);/import { execSync } from "child_process";/g' \
        -e 's/const fs = require(["\x27]fs["\x27]);/import fs from "fs";/g' \
        -e 's/const path = require(["\x27]path["\x27]);/import path from "path";/g' \
        "$temp_dir/scripts/check-lowercase.js" > "scripts/check-lowercase.js"
    
    # Convert git-reminder.js to ES modules
    sed -e 's/const { execSync } = require(["\x27]child_process["\x27]);/import { execSync } from "child_process";/g' \
        -e 's/const fs = require(["\x27]fs["\x27]);/import fs from "fs";/g' \
        -e 's/const path = require(["\x27]path["\x27]);/import path from "path";/g' \
        "$temp_dir/scripts/git-reminder.js" > "scripts/git-reminder.js"
    
    # Create templates directory if it doesn't exist
    mkdir -p templates
    
    # Copy template files
    cp "$temp_dir/templates/pre-commands.js" "templates/pre-commands.js"
    
    echo "✅ Updated scripts (converted to ES modules)"
else
    # Copy scripts as-is for CommonJS
    cp "$temp_dir/scripts/check-gitignore.js" "scripts/check-gitignore.js"
    cp "$temp_dir/scripts/build-react-apps.js" "scripts/build-react-apps.js"
    cp "$temp_dir/scripts/check-lowercase.js" "scripts/check-lowercase.js"
    cp "$temp_dir/scripts/git-reminder.js" "scripts/git-reminder.js"
    
    # Create templates directory if it doesn't exist
    mkdir -p templates
    
    # Copy template files
    cp "$temp_dir/templates/pre-commands.js" "templates/pre-commands.js"
    
    echo "✅ Updated scripts"
fi

# Make scripts executable
chmod +x "scripts/check-gitignore.js" "scripts/build-react-apps.js" "scripts/check-lowercase.js" "scripts/git-reminder.js"

# Update package.json scripts
if [ -f "package.json" ]; then
    echo -e "\n📝 Updating package.json scripts..."
    
    # Create a temporary file for the new package.json
    tmp_file=$(mktemp)
    
    # Use node to modify package.json
    node -e "
        const fs = require('fs');
        const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
        
        if (!packageJson.scripts) {
            packageJson.scripts = {};
        }
        
        // Update scripts
        packageJson.scripts['check-gitignore'] = 'node scripts/check-gitignore.js';
        packageJson.scripts['check-lowercase'] = 'node scripts/check-lowercase.js';
        packageJson.scripts['git-reminder'] = 'node scripts/git-reminder.js';
        
        // Remove build:dev script if it exists (to prevent infinite loop)
        if (packageJson.scripts['build:dev']) {
            delete packageJson.scripts['build:dev'];
            console.log('✅ Removed build:dev script to prevent infinite loop');
        }
        
        fs.writeFileSync('$tmp_file', JSON.stringify(packageJson, null, 2));
    "
    
    # Replace the original package.json with the updated one
    mv "$tmp_file" "package.json"
    echo "✅ Updated package.json scripts"
fi

# Update the hook
echo -e "\n📝 Updating $current_hook_type hook..."
cat > ".husky/$current_hook_type" << 'EOF'
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

# Check .gitignore for sensitive files
npm run check-gitignore

# Check for lowercase file names and import statements
npm run check-lowercase

# Run build for React apps directly
npm run build

# Run git reminder
npm run git-reminder
EOF

# Make the hook executable
chmod +x ".husky/$current_hook_type"
echo "✅ Updated $current_hook_type hook"

# Clean up
rm -rf "$temp_dir"

echo -e "\n🎉 React Build Git Hooks have been updated to the latest version!"
echo -e "\nChanges in this update:"
echo "- Fixed infinite build loop issue"
echo "- Added Husky v10 compatibility"
echo "- Improved error handling"
echo "- Added lowercase naming suggestions"
echo "- Added Git reminder feature"
echo "- Added uninstallation options"
