#!/bin/bash

# React Build Git Hooks Updater
# This script updates the React Build Git Hooks to the latest version

# Set variables
REPO_URL="https://github.com/chirag6451/react_hooks.git"
TARGET_DIR="$(pwd)"
TEMP_DIR=$(mktemp -d)

# Function to clean up temporary files
cleanup() {
  echo "Cleaning up temporary files..."
  rm -rf "$TEMP_DIR"
}

# Set trap to clean up on exit
trap cleanup EXIT

# Check if current directory is a git repository
if [ ! -d ".git" ]; then
  echo "❌ Error: Current directory is not a git repository."
  echo "Please run this script from the root of your git repository."
  exit 1
fi

# Print header
echo "🔄 React Build Git Hooks Updater"
echo "======================================"
echo

# Clone the latest version
echo "📥 Downloading the latest version..."
git clone --quiet "$REPO_URL" "$TEMP_DIR" || {
  echo "❌ Error: Failed to download the latest version."
  exit 1
}

# Check if pre-commit hook exists
if [ -f ".husky/pre-commit" ]; then
  echo "🔍 Detected pre-commit hook in use."
else
  echo "❌ Error: No pre-commit hook found."
  echo "Please run the installation script first."
  exit 1
fi

echo
echo "📝 Updating scripts..."

# Check if this is an ES modules project
is_esm=false
if [ -f "package.json" ]; then
  if grep -q '"type":\s*"module"' package.json; then
    is_esm=true
    echo "📦 Detected ES modules project"
  fi
fi

# Create scripts directory if it doesn't exist
mkdir -p scripts

# Create templates directory if it doesn't exist
mkdir -p templates

# Copy scripts from the temp directory
cp -f "$TEMP_DIR/scripts/build-react-apps.js" "scripts/"
cp -f "$TEMP_DIR/scripts/check-gitignore.js" "scripts/"
cp -f "$TEMP_DIR/scripts/check-lowercase.js" "scripts/"
cp -f "$TEMP_DIR/scripts/git-reminder.js" "scripts/"

# Copy templates from the temp directory
cp -f "$TEMP_DIR/templates/pre-commands.js" "templates/"

# Copy configuration files (don't overwrite existing ones)
if [ ! -f "hooks-config.js" ]; then
  cp -f "$TEMP_DIR/hooks-config.js" "./"
  echo "✅ Created hooks-config.js configuration file"
else
  echo "ℹ️ Existing hooks-config.js file preserved"
fi

if [ ! -f "hooks-config.mjs" ]; then
  cp -f "$TEMP_DIR/hooks-config.mjs" "./"
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
  echo
  echo "📝 Updating package.json scripts..."
  
  # Check if jq is available
  if command -v jq &> /dev/null; then
    # Use jq to update package.json
    jq '.scripts["check-gitignore"] = "node scripts/check-gitignore.js"' package.json > package.json.tmp && mv package.json.tmp package.json
    jq '.scripts["check-lowercase"] = "node scripts/check-lowercase.js"' package.json > package.json.tmp && mv package.json.tmp package.json
    jq '.scripts["git-reminder"] = "node scripts/git-reminder.js"' package.json > package.json.tmp && mv package.json.tmp package.json
  else
    # Fallback to sed if jq is not available
    # This is less reliable but should work for most cases
    if ! grep -q '"check-gitignore":' package.json; then
      sed -i.bak 's/"scripts": {/"scripts": {\n    "check-gitignore": "node scripts\/check-gitignore.js",/' package.json && rm -f package.json.bak
    fi
    
    if ! grep -q '"check-lowercase":' package.json; then
      sed -i.bak 's/"scripts": {/"scripts": {\n    "check-lowercase": "node scripts\/check-lowercase.js",/' package.json && rm -f package.json.bak
    fi
    
    if ! grep -q '"git-reminder":' package.json; then
      sed -i.bak 's/"scripts": {/"scripts": {\n    "git-reminder": "node scripts\/git-reminder.js",/' package.json && rm -f package.json.bak
    fi
  fi
  
  echo "✅ Updated package.json scripts"
fi

# Update pre-commit hook
echo
echo "📝 Updating pre-commit hook..."

# Check if the pre-commit hook already includes our scripts
if ! grep -q "check-gitignore" .husky/pre-commit || ! grep -q "check-lowercase" .husky/pre-commit || ! grep -q "git-reminder" .husky/pre-commit; then
  # Add our scripts to the pre-commit hook
  sed -i.bak '/npm test/d' .husky/pre-commit
  
  if ! grep -q "check-gitignore" .husky/pre-commit; then
    echo -e "\n# Check .gitignore for sensitive files\nnpm run check-gitignore" >> .husky/pre-commit
  fi
  
  if ! grep -q "check-lowercase" .husky/pre-commit; then
    echo -e "\n# Check for lowercase file names and import statements\nnpm run check-lowercase" >> .husky/pre-commit
  fi
  
  if ! grep -q "build-react-apps" .husky/pre-commit && ! grep -q "npm run build" .husky/pre-commit; then
    echo -e "\n# Run build for React apps directly\nnpm run build" >> .husky/pre-commit
  fi
  
  if ! grep -q "git-reminder" .husky/pre-commit; then
    echo -e "\n# Run git reminder\nnpm run git-reminder" >> .husky/pre-commit
  fi
  
  rm -f .husky/pre-commit.bak
fi

echo "✅ Updated pre-commit hook"

# Success message
echo
echo "🎉 React Build Git Hooks have been updated to the latest version!"
echo
echo "Changes in this update:"
echo "- Fixed infinite build loop issue"
echo "- Added Husky v10 compatibility"
echo "- Improved error handling"
echo "- Added lowercase naming suggestions"
echo "- Added Git reminder feature"
echo "- Added configurable hooks system"
echo "- Added uninstallation options"
