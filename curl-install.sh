#!/bin/bash

# React Build Git Hooks Installer
# This script installs the React Build Git Hooks to your project

# Set variables
REPO_URL="https://github.com/chirag6451/react_hooks.git"
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

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
  echo "❌ Error: Node.js is not installed or not in PATH."
  exit 1
fi

# Print header
echo "🚀 React Build Git Hooks Installer"
echo "======================================"
echo

# Check if husky is installed
if [ ! -d "node_modules/husky" ] && ! grep -q "husky" package.json; then
  echo "📦 Installing husky..."
  npm install husky --save-dev
  npx husky init
else
  echo "✅ Husky is already installed."
fi

# Clone the repository
echo "📥 Downloading scripts..."
git clone --quiet "$REPO_URL" "$TEMP_DIR" || {
  echo "❌ Error: Failed to download the scripts."
  exit 1
}

# Create directories
mkdir -p scripts
mkdir -p templates

# Copy scripts
cp -f "$TEMP_DIR/scripts/build-react-apps.js" "scripts/"
cp -f "$TEMP_DIR/scripts/check-gitignore.js" "scripts/"
cp -f "$TEMP_DIR/scripts/check-lowercase.js" "scripts/"
cp -f "$TEMP_DIR/scripts/git-reminder.js" "scripts/"

# Copy templates
cp -f "$TEMP_DIR/templates/pre-commands.js" "templates/"

# Copy configuration files
cp -f "$TEMP_DIR/hooks-config.js" "./"
cp -f "$TEMP_DIR/hooks-config.mjs" "./"

# Make scripts executable
chmod +x scripts/build-react-apps.js
chmod +x scripts/check-gitignore.js
chmod +x scripts/check-lowercase.js
chmod +x scripts/git-reminder.js

# Update package.json
echo "📝 Updating package.json..."

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

# Create pre-commit hook
echo "📝 Creating pre-commit hook..."
mkdir -p .husky
cat > .husky/pre-commit << 'EOF'
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

# Make hook executable
chmod +x .husky/pre-commit

echo "🎉 React Build Git Hooks have been installed successfully!"
echo
echo "The following hooks have been installed:"
echo "- Build verification: Ensures your React app builds successfully before committing"
echo "- Gitignore check: Ensures your .gitignore contains essential patterns"
echo "- Lowercase check: Suggests using lowercase for file names and import paths"
echo "- Git reminder: Reminds you to commit regularly and checks for uncommitted changes"
echo
echo "You can customize the behavior of each hook by editing the hooks-config.js file."
echo "To update the hooks in the future, run: curl -fsSL https://raw.githubusercontent.com/chirag6451/react_hooks/main/curl-update.sh | bash"
