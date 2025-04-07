# React Build Git Hooks

This repository contains Git hooks that enforce running build commands for React apps before commits or pushes and ensure sensitive files are properly added to .gitignore. This ensures that all team members verify their builds work before sharing code and don't accidentally commit sensitive information.

## Features

- Automatically finds all React apps in your repository
- Runs the appropriate build command for each app (`build:dev` or `build`)
- Prevents commits/pushes if any build fails
- Checks and updates .gitignore to include sensitive files and directories
- Easy to install and distribute to your team

## Quick Installation

### One-Line Installation (macOS/Linux)

For the quickest installation, run this command in your project directory:

```bash
curl -fsSL https://raw.githubusercontent.com/chirag6451/react_hooks/main/curl-install.sh -o install.sh && bash install.sh
```

This will download and install everything you need without having to clone the repository.

### One-Click Installation (macOS/Linux)

1. Download the `one-click-install.sh` file
2. Make it executable: `chmod +x one-click-install.sh`
3. Run it: `./one-click-install.sh`

### One-Click Installation (Windows)

For Windows users, we provide one-click installers that make setup extremely simple:

#### Using Batch Script
1. Download the `one-click-install.bat` file
2. Navigate to your React project in File Explorer
3. Double-click the `one-click-install.bat` file

#### Using PowerShell
1. Download the `one-click-install.ps1` file
2. Right-click and select "Run with PowerShell"
   - Or open PowerShell, navigate to your project, and run `.\one-click-install.ps1`

That's it! The script will:
- Check prerequisites (Node.js, Git, package.json)
- Clone the repository to a temporary location
- Install all necessary files and scripts
- Set up the Git hooks
- Clean up temporary files

## Installation Options

### Option 1: For a New Project

1. Clone this repository or copy its contents to your project:

```bash
git clone https://github.com/chirag6451/react_hooks.git
# or
git clone git@github.com:chirag6451/react_hooks.git
```

2. Install dependencies:

```bash
npm install
```

3. Run the setup script:

```bash
# For macOS/Linux
node setup.js
# or
./install-mac.sh

# For Windows
.\install-windows.bat
# or
.\install-windows.ps1
```

### Option 2: Adding to an Existing Project

1. Clone this repository to a temporary location:

```bash
git clone https://github.com/chirag6451/react_hooks.git
cd react_hooks
```

2. Run the install-to-project script, pointing to your existing project:

```bash
# For macOS/Linux
node install-to-project.js /path/to/your/project
# or
./install-mac.sh /path/to/your/project

# For Windows
.\install-windows.bat
# or
.\install-windows.ps1
```

Or navigate to your project directory first, then run:

```bash
# For macOS/Linux
node /path/to/react_hooks/install-to-project.js
# or
/path/to/react_hooks/install-mac.sh

# For Windows
/path/to/react_hooks/install-windows.bat
# or
/path/to/react_hooks/install-windows.ps1
```

This will:
- Add husky as a dev dependency to your project
- Copy the necessary scripts
- Update your package.json
- Set up the Git hooks

### Option 3: Using npm (if published)

If you publish this package to npm, your team can install it directly:

```bash
# In your existing project
npm install react-build-hooks --save-dev
```

## Distributing to Your Team

### Method 1: Include in Your Project

Once you've added these hooks to your project, team members will automatically get them when they:

1. Clone your repository
2. Run `npm install`

The `prepare` script will automatically set up Husky and the Git hooks.

### Method 2: Share the One-Line Installer (macOS/Linux)

For macOS/Linux users, share this one-line command:

```bash
curl -fsSL https://raw.githubusercontent.com/chirag6451/react_hooks/main/curl-install.sh -o install.sh && bash install.sh
```

Team members just need to run this command in their React project directory.

### Method 3: Share the One-Click Installers

#### For macOS/Linux Users
Share the `one-click-install.sh` file. Team members need to:
1. Make it executable: `chmod +x one-click-install.sh`
2. Run it: `./one-click-install.sh`

#### For Windows Users
Share these files:
- `one-click-install.bat` (Batch script)
- `one-click-install.ps1` (PowerShell script)

Team members just need to place these files in their React project directory and double-click to run.

### Method 4: Share as a Separate Tool

Share the repository with your team and have them run:

```bash
# Clone the hooks repository
git clone https://github.com/chirag6451/react_hooks.git

# Navigate to an existing project
cd /path/to/existing/project

# Install the hooks
# For macOS/Linux
node /path/to/react_hooks/install-to-project.js
# or
/path/to/react_hooks/install-mac.sh

# For Windows
/path/to/react_hooks/install-windows.bat
# or
/path/to/react_hooks/install-windows.ps1
```

## How It Works

The hooks perform two main functions:

### 1. .gitignore Check

Before each commit/push, the hook:
- Checks if your .gitignore file includes essential patterns for sensitive files
- Automatically adds any missing patterns to .gitignore
- Adds the updated .gitignore to your commit

The check includes patterns for:
- Node.js files (node_modules, logs)
- Environment files (.env, .env.local)
- IDE files (.vscode, .idea)
- Build outputs (dist, build)
- And many more common patterns

### 2. React Build Check

After the gitignore check, the hook:
- Finds all React applications in your repository
- For each React app, runs either `npm run build:dev` or `npm run build`
- Prevents the commit/push if any build fails

## Customization

You can modify the scripts to customize:
- `scripts/build-react-apps.js` - How React apps are detected and built
- `scripts/check-gitignore.js` - Which patterns are checked in .gitignore

## Troubleshooting

If you need to bypass the hooks temporarily (not recommended), you can use:

```bash
git commit --no-verify
# or
git push --no-verify
```

### macOS/Linux-Specific Issues

- **Permission Issues**: If you get "Permission denied" errors, make sure the scripts are executable:
  ```bash
  chmod +x install-mac.sh one-click-install.sh
  ```

### Windows-Specific Issues

- **Script Execution Policy**: If PowerShell scripts fail to run, you may need to adjust your execution policy:
  ```powershell
  Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
  ```

- **Permission Issues**: Try running the scripts as Administrator if you encounter permission problems

## Requirements

- Node.js 14 or later
- Git
