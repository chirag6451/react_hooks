# React Build Git Hooks

<div align="center">

![React Build Git Hooks](https://img.shields.io/badge/React-Build%20Hooks-61DAFB?style=for-the-badge&logo=react)
![Git Hooks](https://img.shields.io/badge/Git-Hooks-F05032?style=for-the-badge&logo=git)
![Node.js](https://img.shields.io/badge/Node.js-14+-339933?style=for-the-badge&logo=node.js)

**Enforce React builds, secure .gitignore patterns, suggest lowercase naming conventions, and remind about uncommitted changes before commits**

</div>

## 🚨 Why Pre-commit Checks Are Necessary

Pre-commit hooks act like a gatekeeper to your codebase. They help catch issues before bad code or sensitive data gets into your Git history (which is permanent and hard to fix later). Here's why running npm run build, .gitignore checks, and security-related checks pre-commit is so important:

### 1. 🏗️ npm run build (or npm run build:dev)
✅ **Purpose**: Verify that your app compiles correctly.

**Why it matters**:
- Catches broken builds early – prevents commits that crash CI/CD pipelines.
- Avoids pushing broken code that blocks your team or production deploys.
- Ensures all dependencies are correctly wired (TypeScript types, imports, etc.).

🧠 **Optional**: Do this in pre-push instead of pre-commit if the build takes a while.

### 2. 🔐 .gitignore Check for Sensitive Files
✅ **Purpose**: Prevent committing sensitive or unnecessary files like:
- .env
- node_modules/
- npm_install
- package-lock.json (if you're not locking deps)
- .DS_Store, Thumbs.db, logs, etc.

**Why it matters**:
- .env files often contain secrets (API keys, DB creds, etc.)
- If you push it once, it's forever in Git history unless force-cleaned.
- node_modules/ is huge and shouldn't be versioned.
- Accidentally committing npm_install or build output clutters the repo.

### 3. 🔍 Lowercase Suggestions
✅ **Purpose**: Suggest using lowercase for all file names and import statements for consistency across your codebase.

**Why it matters**:
- Prevents issues on case-sensitive systems.
- Maintains consistent naming conventions across your codebase.
- Provides helpful warnings without blocking your workflow.

### 4. ⏰ Git Reminders
✅ **Purpose**: Encourage regular commits and notify about uncommitted changes.

**Why it matters**:
- Prevents accidental code loss by reminding developers to commit frequently.
- Helps maintain a clean Git history with smaller, more focused commits.
- Notifies about uncommitted changes before starting work.
- Alerts when your branch is behind the remote, preventing merge conflicts.

## Overview

React Build Git Hooks is a powerful, zero-configuration solution that enforces four critical practices in your React projects:

1. **Build Verification**: Automatically builds all React apps in your repository before each commit to ensure they compile successfully.
2. **Security Checks**: Ensures sensitive files (like `.env`, `node_modules`) are properly added to `.gitignore`.
3. **Lowercase Suggestions**: Provides friendly warnings when file names and import statements don't use lowercase, without blocking your workflow.
4. **Git Reminders**: Encourages regular commits and notifies about uncommitted changes to prevent code loss.

This helps teams maintain high-quality code and prevents accidental exposure of sensitive information.

## Features

- 🔍 **Build Verification**: Automatically builds your React apps before committing to ensure there are no build errors
- 🛡️ **Security Check**: Ensures your `.gitignore` file contains essential patterns to prevent sensitive files from being committed
- 📝 **Lowercase Suggestions**: Provides warnings for files with uppercase names and import statements to maintain consistency
- ⏰ **Git Reminders**: Reminds you to commit regularly and checks for uncommitted changes
- ⚙️ **Configurable Hooks**: Control whether hooks block commits or just provide warnings via the configuration file

## Configuration

You can customize the behavior of each hook using the `hooks-config.js` (or `hooks-config.mjs` for ES modules) file that is installed in your project root.

### Configuration Options

```js
module.exports = {
  // Build verification hook
  build: {
    enforce: true, // Block commits if build fails
    enabled: true  // Enable build verification
  },
  
  // Gitignore check hook
  gitignore: {
    enforce: true, // Block commits if .gitignore is missing essential patterns
    enabled: true  // Enable gitignore check
  },
  
  // Lowercase check hook
  lowercase: {
    enforce: false, // Only warn about uppercase file names and imports
    enabled: true   // Enable lowercase check
  },
  
  // Git reminder hook
  gitReminder: {
    enforce: false, // Only provide reminders, don't block commits
    enabled: true,  // Enable git reminders
    
    // Additional settings for git reminder
    settings: {
      hoursThreshold: 4 // Warn if last commit was more than 4 hours ago
    }
  }
};
```

### Configuration Properties

For each hook, you can set:

- `enforce`: When `true`, the hook will block commits if issues are found. When `false`, it will only show warnings.
- `enabled`: When `true`, the hook is active. When `false`, the hook is completely disabled.

The Git reminder hook also has additional settings:

- `hoursThreshold`: Number of hours since the last commit before showing a warning.

### Example: Enforcing Lowercase Names

If you want to enforce lowercase file names and import paths, update your configuration:

```js
module.exports = {
  // ... other config
  lowercase: {
    enforce: true, // Block commits if uppercase names are found
    enabled: true
  }
  // ... other config
};
```

### Example: Disabling a Hook

If you want to disable the build verification hook:

```js
module.exports = {
  // ... other config
  build: {
    enforce: false,
    enabled: false // Completely disable build verification
  }
  // ... other config
};
```

## Table of Contents

- [Quick Installation](#-quick-installation)
- [Detailed Installation Options](#-detailed-installation-options)
- [How It Works](#-how-it-works)
- [Team Distribution](#-team-distribution)
- [Customization](#-customization)
- [Troubleshooting](#-troubleshooting)
- [Requirements](#-requirements)
- [Contributing](#-contributing)
- [License](#-license)
- [Uninstallation](#-uninstallation)
- [Updating](#-updating)

## Quick Installation

### macOS/Linux (One-Line Install)

```bash
curl -fsSL https://raw.githubusercontent.com/chirag6451/react_hooks/main/curl-install.sh -o install.sh && bash install.sh
```

### macOS/Linux (Shell Script)

```bash
# Download the script
curl -fsSL https://raw.githubusercontent.com/chirag6451/react_hooks/main/one-click-install.sh -o one-click-install.sh

# Make it executable
chmod +x one-click-install.sh

# Run it
./one-click-install.sh
```

### Windows (PowerShell)

```powershell
# Download the script
Invoke-WebRequest -Uri https://raw.githubusercontent.com/chirag6451/react_hooks/main/one-click-install.ps1 -OutFile one-click-install.ps1

# Run it
.\one-click-install.ps1
```

### Windows (Batch)

1. Download [one-click-install.bat](https://raw.githubusercontent.com/chirag6451/react_hooks/main/one-click-install.bat)
2. Navigate to your React project in File Explorer
3. Double-click the `one-click-install.bat` file

## Detailed Installation Options

### Option 1: For a New Project

1. Clone this repository:

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

### Option 3: Using npm (if published)

If you publish this package to npm, your team can install it directly:

```bash
# In your existing project
npm install react-build-hooks --save-dev
```

## How It Works

The hooks perform four main functions:

### 1. .gitignore Check

Before each commit/push, the hook:

1. Scans your repository for sensitive patterns that should be in `.gitignore`
2. If any are missing, automatically adds them to your `.gitignore` file
3. Adds the updated `.gitignore` to your commit

The check includes patterns for:
- Node.js files (`node_modules`, logs)
- Environment files (`.env`, `.env.local`)
- IDE files (`.vscode`, `.idea`)
- Build outputs (`dist`, `build`)
- And many more common patterns

### 2. React Build Check

After the gitignore check, the hook:

1. Finds all React applications in your repository by scanning for package.json files with React dependencies
2. For each React app, runs either `npm run build:dev` or `npm run build` (preferring build:dev if available)
3. If any build fails, prevents the commit/push with a helpful error message

### 3. Lowercase Suggestions

After the build check, the hook:

1. Scans your repository for file names and import statements that do not use lowercase
2. If any are found, provides helpful warnings but allows the commit to proceed

### 4. Git Reminders

The Git reminder feature:

1. Checks for uncommitted changes in your repository
2. Notifies how long it's been since your last commit
3. Checks if your branch is behind the remote
4. Provides helpful warnings but allows the command to proceed

## Using Pre-Command Hooks

In addition to Git hooks, this package includes templates for setting up pre-command hooks in your `package.json`. These hooks run before npm commands like `npm run dev` or `npm run build` to remind developers to commit their code regularly.

### Setting Up Pre-Command Hooks

1. Check the `templates/pre-commands.js` file for examples of pre-command hooks.
2. Add the relevant scripts to your `package.json` file:

```json
{
  "scripts": {
    "git-reminder": "node scripts/git-reminder.js",
    "predev": "npm run git-reminder",
    "dev": "your-dev-command",
    "prebuild": "npm run git-reminder",
    "build": "your-build-command"
  }
}
```

3. Now, whenever you run `npm run dev` or `npm run build`, the git-reminder script will run first, reminding you to commit your code regularly.

### Benefits of Pre-Command Hooks

- **Prevent Code Loss**: Regular reminders to commit code reduce the risk of losing work
- **Cleaner Git History**: Encourages smaller, more focused commits
- **Team Awareness**: Keeps everyone informed about their Git status
- **No External Dependencies**: Works with npm's built-in pre/post hooks

## Team Distribution

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

## Customization

You can modify the scripts to customize:

### Build Detection and Execution

Edit `scripts/build-react-apps.js` to:
- Change how React apps are detected
- Modify which build commands are run
- Add additional checks or validations

```javascript
// Example: Change the build script priority
if (packageJson.scripts && (packageJson.scripts['custom-build'] || packageJson.scripts.build)) {
  reactApps.push({
    dir,
    buildScript: packageJson.scripts['custom-build'] ? 'custom-build' : 'build'
  });
}
```

### .gitignore Pattern Checking

Edit `scripts/check-gitignore.js` to:
- Add or remove patterns to check for
- Change how patterns are added to .gitignore
- Modify the behavior when patterns are missing

```javascript
// Example: Add custom patterns to check
const essentialPatterns = [
  // Your custom patterns
  'secrets/',
  '*.key',
  // ...existing patterns
];
```

### Lowercase Enforcement

Edit `scripts/check-lowercase.js` to:
- Modify which files are checked for lowercase naming
- Adjust the import statement patterns

```javascript
// Example: Add custom file extensions to check
const fileExtensions = [
  // Your custom file extensions
  '.js',
  '.jsx',
  '.ts',
  '.tsx',
  // ...existing file extensions
];
```

### Git Reminder

Edit `scripts/git-reminder.js` to:
- Change the time threshold for commit warnings
- Modify the checks performed

```javascript
// Example: Change the time threshold
const timeThreshold = 60 * 60 * 1000; // 1 hour
```

## 🗑️ Troubleshooting

### Common Issues

#### Missing check-gitignore script
If you see an error like:
```
npm error Missing script: "check-gitignore"
```
This means the script is missing from your package.json. Run the fix-husky-hooks.js script to add it:
```bash
node fix-husky-hooks.js
```

#### Infinite Build Loop
If you see the build script running in an infinite loop like this:
```
> npm run build:dev
> node scripts/build-react-apps.js
...
> npm run build:dev
> node scripts/build-react-apps.js
...
```

This happens because the build script is calling itself recursively. To fix this:

1. Edit your `.husky/pre-commit` file to use the direct build script:
   ```bash
   #!/bin/sh
   
   # Check .gitignore for sensitive files
   npm run check-gitignore
   
   # Run build for React apps directly
   npm run build
   ```

2. Remove the `build:dev` script from your package.json if it exists

#### Husky v10 Compatibility Warning
If you see a warning like:
```
husky - DEPRECATED

Please remove the following two lines from .husky/pre-commit:

#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

They WILL FAIL in v10.0.0
```

This is because Husky v10 has changed how hooks are structured. Run our fix script:
```bash
node fix-husky-hooks.js
```

This script will:
1. Remove the deprecated lines from your hooks
2. Ensure the check-gitignore script is in your package.json
3. Make your hooks compatible with Husky v10

#### Build Failing
If your build fails, check the error message for clues. Common issues include:
- Missing dependencies
- Incorrect build script
- Build output not found

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
- A React project with a package.json file

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🗑️ Uninstallation

If you no longer want to use the Git hooks, you can easily remove them:

### One-Line Uninstallation

For a quick uninstall, run this command in your React project directory:

```bash
curl -fsSL https://raw.githubusercontent.com/chirag6451/react_hooks/main/curl-uninstall.sh -o uninstall.sh && bash uninstall.sh
```

### Using the Uninstall Script

If you've cloned the repository, run the uninstall script in your project directory:

```bash
# For CommonJS projects
node uninstall.js

# For ES Module projects (with "type": "module" in package.json)
node uninstall.mjs
```

### Manual Uninstallation

1. Remove the hooks from the `.husky` directory:
   ```bash
   rm -f .husky/pre-commit .husky/pre-push
   ```
   
2. Remove the scripts from your `package.json`:
   ```json
   // Remove these entries from the "scripts" section
   "check-gitignore": "node scripts/check-gitignore.js",
   "build:dev": "node scripts/build-react-apps.js"
   ```

3. Remove the script files:
   ```bash
   rm -f scripts/check-gitignore.js scripts/build-react-apps.js
   ```

## 🔄 Updating

When new features or bug fixes are released, you can easily update your Git hooks to the latest version.

### One-Line Update

For a quick update, run this command in your React project directory:

```bash
curl -fsSL https://raw.githubusercontent.com/chirag6451/react_hooks/main/curl-update.sh -o update.sh && bash update.sh
```

### Using the Update Script

If you've cloned the repository, run the update script in your project directory:

```bash
# For CommonJS projects
node update.js

# For ES Module projects (with "type": "module" in package.json)
node update.mjs
```

### Manual Update

1. Remove the existing hooks and scripts:
   ```bash
   rm -f .husky/pre-commit .husky/pre-push
   rm -f scripts/check-gitignore.js scripts/build-react-apps.js
   ```

2. Follow the [installation instructions](#-installation) again to get the latest version.

### What's New in the Latest Update

- Fixed infinite build loop issue
- Added Husky v10 compatibility
- Improved error handling
- Added uninstallation options

---

<div align="center">

**Made with ❤️ by [Chirag Kansara](https://www.linkedin.com/in/indapoint/)**

[Report an Issue](https://github.com/chirag6451/react_hooks/issues) | [Request a Feature](https://github.com/chirag6451/react_hooks/issues)

</div>
