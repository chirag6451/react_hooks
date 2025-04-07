#!/bin/bash

# React Build Hooks - Curl Installer
# This script can be run with:
# curl -fsSL https://raw.githubusercontent.com/chirag6451/react_hooks/main/curl-install.sh | bash

echo "==================================================="
echo " React Build Hooks - Curl Installer"
echo "==================================================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ ERROR: Node.js is not installed or not in PATH."
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi
echo "✅ Node.js detected: $(node -v)"

# Check if Git is installed
if ! command -v git &> /dev/null; then
    echo "❌ ERROR: Git is not installed or not in PATH."
    echo "Please install Git from https://git-scm.com/"
    exit 1
fi
echo "✅ Git detected: $(git --version)"

# Check if running in a Git repository
if ! git rev-parse --is-inside-work-tree &> /dev/null; then
    echo "❌ ERROR: Not in a Git repository."
    echo "Please run this script from within a Git repository."
    exit 1
fi
echo "✅ Git repository detected"

# Check if package.json exists
if [ ! -f "package.json" ]; then
    echo "❌ ERROR: No package.json found."
    echo "Please run this script from the root of a Node.js project."
    exit 1
fi
echo "✅ package.json detected"

# Create a temporary directory for the hooks
temp_dir=$(mktemp -d)
echo -e "\nCreating temporary directory: $temp_dir"

# Download the necessary files
echo "Downloading scripts..."

# Create scripts directory if it doesn't exist
mkdir -p scripts

# Download build-react-apps.js
echo "Downloading build-react-apps.js..."
curl -fsSL https://raw.githubusercontent.com/chirag6451/react_hooks/main/scripts/build-react-apps.js -o scripts/build-react-apps.js
chmod +x scripts/build-react-apps.js

# Download check-gitignore.js
echo "Downloading check-gitignore.js..."
curl -fsSL https://raw.githubusercontent.com/chirag6451/react_hooks/main/scripts/check-gitignore.js -o scripts/check-gitignore.js
chmod +x scripts/check-gitignore.js

# Download update-package-json.js
echo "Downloading update-package-json.js..."
curl -fsSL https://raw.githubusercontent.com/chirag6451/react_hooks/main/scripts/update-package-json.js -o scripts/update-package-json.js
chmod +x scripts/update-package-json.js

echo "✅ All scripts downloaded successfully"

# Install Husky
echo -e "\nInstalling Husky..."
npm install husky --save-dev

# Update package.json to add scripts
echo -e "\nUpdating package.json..."
node "scripts/update-package-json.js" "$(pwd)/package.json"

# Initialize Husky
echo -e "\n🔄 Setting up Git hooks..."
npx husky install || { echo "❌ Failed to initialize Husky"; exit 1; }

# Create the hook script with Husky v10 compatibility
cat > .husky/pre-commit << 'EOF'
#!/bin/sh

# Check .gitignore for sensitive files
npm run check-gitignore

# Run build for React apps directly
npm run build
EOF

# Make the hook executable
chmod +x .husky/pre-commit

echo "✅ Successfully set up pre-commit hook!"

echo -e "\n==================================================="
echo " Installation Complete!"
echo "==================================================="
echo -e "\nThe Git hook will now:"
echo "1. Check and update .gitignore for sensitive files"
echo "2. Enforce building React apps"
echo -e "\nThese checks will run before each commit"
echo -e "\nTo distribute to your team, they just need to run:"
echo "  npm install"
echo ""
