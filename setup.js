#!/usr/bin/env node

/**
 * Setup script to install the Git hooks
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🔧 Setting up React Build Git Hooks...');

// Check if git is initialized
try {
  execSync('git rev-parse --is-inside-work-tree');
} catch (error) {
  console.error('❌ This directory is not a Git repository. Please run this script from a Git repository.');
  process.exit(1);
}

// Make scripts directory executable
try {
  fs.chmodSync(path.join(__dirname, 'scripts', 'build-react-apps.js'), '755');
  fs.chmodSync(path.join(__dirname, 'scripts', 'check-gitignore.js'), '755');
} catch (error) {
  console.warn('⚠️ Could not make scripts executable. You may need to do this manually.');
}

// Install dependencies
console.log('\n📦 Installing dependencies...');
try {
  execSync('npm install', { stdio: 'inherit' });
} catch (error) {
  console.error('❌ Failed to install dependencies:', error.message);
  process.exit(1);
}

// Ask which hook type to use
rl.question('\n🤔 Which hook would you like to use?\n1. pre-commit (runs before each commit)\n2. pre-push (runs before each push)\nEnter 1 or 2: ', (answer) => {
  const hookType = answer.trim() === '2' ? 'pre-push' : 'pre-commit';
  
  console.log(`\n🔄 Setting up ${hookType} hook...`);
  
  // Initialize Husky
  try {
    execSync('npx husky install', { stdio: 'inherit' });
  } catch (error) {
    console.error('❌ Failed to initialize Husky:', error.message);
    process.exit(1);
  }
  
  // Add the hooks
  try {
    // Create the hook script content
    const hookScript = `#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

# Check .gitignore for sensitive files
npm run check-gitignore

# Run build for React apps
npm run build:dev
`;

    // Create the hook file
    const hookPath = `.husky/${hookType}`;
    fs.writeFileSync(hookPath, hookScript);
    fs.chmodSync(hookPath, '755');
    
    console.log(`✅ Successfully added ${hookType} hook!`);
  } catch (error) {
    console.error(`❌ Failed to add ${hookType} hook:`, error.message);
    process.exit(1);
  }
  
  console.log('\n🎉 Setup complete! The Git hook will now:');
  console.log('1. Check and update .gitignore for sensitive files');
  console.log('2. Enforce building React apps');
  console.log(`These checks will run before each ${hookType === 'pre-commit' ? 'commit' : 'push'}.`);
  console.log('\n👥 To distribute to your team, they just need to run:');
  console.log('   npm install');
  
  rl.close();
});
