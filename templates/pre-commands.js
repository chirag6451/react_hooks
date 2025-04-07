/**
 * Template file for setting up pre-command hooks in package.json
 * 
 * This file shows how to set up pre-command hooks to remind users to commit
 * their code regularly and check for uncommitted changes.
 * 
 * To use this, copy the relevant scripts to your package.json file.
 */

const packageJsonExample = {
  "scripts": {
    // Git reminder script
    "git-reminder": "node scripts/git-reminder.js",
    
    // Pre-command hooks for common commands
    "predev": "npm run git-reminder",
    "dev": "your-dev-command",
    
    "prebuild": "npm run git-reminder",
    "build": "your-build-command",
    
    "pretest": "npm run git-reminder",
    "test": "your-test-command",
    
    "prestart": "npm run git-reminder",
    "start": "your-start-command",
    
    // Add more pre-commands as needed for your project
    "prelint": "npm run git-reminder",
    "lint": "your-lint-command"
  }
};

// This is just a template file, not meant to be executed
console.log("This is a template file. Copy the relevant scripts to your package.json file.");
