#!/bin/bash

# React Build Hooks - One-Click macOS Installer
echo "==================================================="
echo " React Build Hooks - One-Click macOS Installer"
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
cd "$temp_dir"

# Clone the repository
echo "Cloning React Build Hooks repository..."
if ! git clone https://gitlab.com/chirag-indapoint/react-hooks.git .; then
    echo "❌ ERROR: Failed to clone repository."
    cd - > /dev/null
    rm -rf "$temp_dir"
    exit 1
fi
echo "✅ Repository cloned successfully"

# Get the original directory
original_dir=$(pwd)

# Copy the necessary files to the original project
echo -e "\nCopying files to your project..."
mkdir -p "$original_dir/scripts"
cp -f "scripts/build-react-apps.js" "$original_dir/scripts/"
cp -f "scripts/check-gitignore.js" "$original_dir/scripts/"
cp -f "scripts/update-package-json.js" "$original_dir/scripts/"
chmod +x "$original_dir/scripts/build-react-apps.js" "$original_dir/scripts/check-gitignore.js" "$original_dir/scripts/update-package-json.js"
echo "✅ Files copied successfully"

# Install Husky
echo -e "\nInstalling Husky..."
cd "$original_dir"
npm install husky --save-dev

# Update package.json to add scripts
echo -e "\nUpdating package.json..."
node "scripts/update-package-json.js" "$(pwd)/package.json"

# Initialize Husky
echo -e "\nInitializing Husky..."
npx husky install

# Ask which hook to use
echo -e "\nWhich hook would you like to use?"
echo "1. pre-commit (runs before each commit)"
echo "2. pre-push (runs before each push)"
read -p "Enter 1 or 2: " hook_choice

if [ "$hook_choice" = "2" ]; then
    hook_type="pre-push"
else
    hook_type="pre-commit"
fi

# Create the hook script
echo -e "\nCreating $hook_type hook..."
if [ ! -d ".husky" ]; then
    mkdir -p .husky
fi

cat > ".husky/$hook_type" << EOL
#!/bin/sh
. "\$(dirname "\$0")/_/husky.sh"

# Check .gitignore for sensitive files
npm run check-gitignore

# Run build for React apps
npm run build:dev
EOL

# Make the hook executable
chmod +x ".husky/$hook_type"
echo "✅ Hook created and made executable"

# Clean up
echo -e "\nCleaning up temporary files..."
rm -rf "$temp_dir"
echo "✅ Cleanup complete"

echo -e "\n==================================================="
echo " One-Click Installation Complete!"
echo "==================================================="
echo -e "\nThe Git hook will now:"
echo "1. Check and update .gitignore for sensitive files"
echo "2. Enforce building React apps"
echo -e "\nThese checks will run before each ${hook_type/pre-/}"
echo -e "\nTo distribute to your team, they just need to run:"
echo "  npm install"
echo ""

read -p "Press Enter to exit..."
