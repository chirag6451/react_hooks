# React Build Git Hooks

This repository contains Git hooks that enforce running build commands for React apps before commits or pushes and ensure sensitive files are properly added to .gitignore. This ensures that all team members verify their builds work before sharing code and don't accidentally commit sensitive information.

## Features

- Automatically finds all React apps in your repository
- Runs the appropriate build command for each app (`build:dev` or `build`)
- Prevents commits/pushes if any build fails
- Checks and updates .gitignore to include sensitive files and directories
- Easy to install and distribute to your team

## Installation Options

### Option 1: For a New Project

1. Clone this repository or copy its contents to your project:

```bash
git clone https://github.com/yourusername/react-build-hooks.git
# or copy the files manually
```

2. Install dependencies:

```bash
npm install
```

3. Run the setup script:

```bash
node setup.js
```

### Option 2: Adding to an Existing Project

1. Clone this repository to a temporary location:

```bash
git clone https://github.com/yourusername/react-build-hooks.git
cd react-build-hooks
```

2. Run the install-to-project script, pointing to your existing project:

```bash
node install-to-project.js /path/to/your/project
```

Or navigate to your project directory first, then run:

```bash
node /path/to/react-build-hooks/install-to-project.js
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

### Method 2: Share as a Separate Tool

Share the repository with your team and have them run:

```bash
# Clone the hooks repository
git clone https://github.com/yourusername/react-build-hooks.git

# Navigate to an existing project
cd /path/to/existing/project

# Install the hooks
node /path/to/react-build-hooks/install-to-project.js
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

## Requirements

- Node.js 14 or later
- Git
