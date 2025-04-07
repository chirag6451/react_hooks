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

# Copy scripts
mkdir -p scripts
cp -f "$temp_dir/scripts/build-react-apps.js" "scripts/"
cp -f "$temp_dir/scripts/check-gitignore.js" "scripts/"
cp -f "$temp_dir/scripts/check-lowercase.js" "scripts/"
cp -f "$temp_dir/scripts/git-reminder.js" "scripts/"

# Copy templates
mkdir -p templates
cp -f "$temp_dir/templates/pre-commands.js" "templates/"

# Copy configuration files (don't overwrite existing ones)
if [ ! -f "hooks-config.js" ]; then
  cp -f "$temp_dir/hooks-config.js" "."
  echo "✅ Created hooks-config.js configuration file"
else
  echo "ℹ️ Existing hooks-config.js file preserved"
fi

if [ ! -f "hooks-config.mjs" ]; then
  cp -f "$temp_dir/hooks-config.mjs" "."
  echo "✅ Created hooks-config.mjs configuration file"
else
  echo "ℹ️ Existing hooks-config.mjs file preserved"
fi

# Make scripts executable
chmod +x "scripts/build-react-apps.js"
chmod +x "scripts/check-gitignore.js"
chmod +x "scripts/check-lowercase.js"
chmod +x "scripts/git-reminder.js"

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
