#!/usr/bin/env node

/**
 * Script to update React Build Git Hooks to the latest version
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🔄 Updating React Build Git Hooks...');

// Check if git is initialized
try {
  execSync('git rev-parse --is-inside-work-tree');
} catch (error) {
  console.error('❌ This directory is not a Git repository. Please run this script from a Git repository.');
  process.exit(1);
}

// Create a temporary directory for the update
const tempDir = path.join(__dirname, '.temp-update');
if (fs.existsSync(tempDir)) {
  try {
    execSync(`rm -rf "${tempDir}"`);
  } catch (error) {
    console.error('❌ Failed to remove existing temporary directory:', error.message);
    process.exit(1);
  }
}

fs.mkdirSync(tempDir, { recursive: true });

// Clone the latest version
console.log('\n📥 Downloading the latest version...');
try {
  execSync(`git clone https://github.com/chirag6451/react_hooks.git "${tempDir}"`, { stdio: 'inherit' });
} catch (error) {
  console.error('❌ Failed to download the latest version:', error.message);
  process.exit(1);
}

// Check which hook type is currently used
let currentHookType = 'pre-commit';
if (fs.existsSync('.husky/pre-push')) {
  currentHookType = 'pre-push';
}

console.log(`\n🔍 Detected ${currentHookType} hook in use.`);

// Update the scripts
console.log('\n📝 Updating scripts...');

// Copy the latest script files
try {
  const scriptsDir = path.join(process.cwd(), 'scripts');
  if (!fs.existsSync(scriptsDir)) {
    fs.mkdirSync(scriptsDir, { recursive: true });
  }
  
  // Copy build-react-apps.js
  fs.copyFileSync(
    path.join(tempDir, 'scripts', 'build-react-apps.js'),
    path.join(scriptsDir, 'build-react-apps.js')
  );
  console.log('✅ Updated build-react-apps.js');
  
  // Copy check-gitignore.js
  fs.copyFileSync(
    path.join(tempDir, 'scripts', 'check-gitignore.js'),
    path.join(scriptsDir, 'check-gitignore.js')
  );
  console.log('✅ Updated check-gitignore.js');
  
  // Copy check-lowercase.js
  fs.copyFileSync(
    path.join(tempDir, 'scripts', 'check-lowercase.js'),
    path.join(scriptsDir, 'check-lowercase.js')
  );
  console.log('✅ Updated check-lowercase.js');
  
  // Copy git-reminder.js
  fs.copyFileSync(
    path.join(tempDir, 'scripts', 'git-reminder.js'),
    path.join(scriptsDir, 'git-reminder.js')
  );
  console.log('✅ Updated git-reminder.js');

  // Create templates directory if it doesn't exist
  const templatesDir = path.join(process.cwd(), 'templates');
  if (!fs.existsSync(templatesDir)) {
    fs.mkdirSync(templatesDir, { recursive: true });
  }

  // Copy template files
  fs.copyFileSync(
    path.join(tempDir, 'templates', 'pre-commands.js'),
    path.join(templatesDir, 'pre-commands.js')
  );
  console.log('✅ Updated template files');

  // Make scripts executable
  fs.chmodSync(path.join(scriptsDir, 'build-react-apps.js'), '755');
  fs.chmodSync(path.join(scriptsDir, 'check-gitignore.js'), '755');
  fs.chmodSync(path.join(scriptsDir, 'check-lowercase.js'), '755');
  fs.chmodSync(path.join(scriptsDir, 'git-reminder.js'), '755');
} catch (error) {
  console.error('❌ Failed to update script files:', error.message);
}

// Update package.json scripts
try {
  const packageJsonPath = path.join(process.cwd(), 'package.json');
  if (fs.existsSync(packageJsonPath)) {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    
    if (!packageJson.scripts) {
      packageJson.scripts = {};
    }
    
    // Update scripts
    if (!packageJson.scripts['check-gitignore']) {
      packageJson.scripts['check-gitignore'] = 'node scripts/check-gitignore.js';
    }
    
    if (!packageJson.scripts['check-lowercase']) {
      packageJson.scripts['check-lowercase'] = 'node scripts/check-lowercase.js';
    }
    
    if (!packageJson.scripts['git-reminder']) {
      packageJson.scripts['git-reminder'] = 'node scripts/git-reminder.js';
    }
    
    // Remove build:dev script if it exists (to prevent infinite loop)
    if (packageJson.scripts['build:dev']) {
      delete packageJson.scripts['build:dev'];
      console.log('✅ Removed build:dev script to prevent infinite loop');
    }
    
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
    console.log('✅ Updated package.json scripts');
  }
} catch (error) {
  console.error('❌ Failed to update package.json:', error.message);
}

// Update the hook
console.log(`\n📝 Updating ${currentHookType} hook...`);
try {
  const hookPath = path.join('.husky', currentHookType);
  const hookContent = `#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

# Check .gitignore for sensitive files
npm run check-gitignore

# Check for lowercase file names and import statements
npm run check-lowercase

# Run build for React apps directly
npm run build

# Run git reminder
npm run git-reminder
`;
  
  fs.writeFileSync(hookPath, hookContent);
  fs.chmodSync(hookPath, '755');
  console.log(`✅ Updated ${currentHookType} hook`);
} catch (error) {
  console.error(`❌ Failed to update ${currentHookType} hook:`, error.message);
}

// Clean up
try {
  execSync(`rm -rf "${tempDir}"`);
} catch (error) {
  console.warn('⚠️ Failed to clean up temporary directory. You may want to delete it manually.');
}

console.log('\n🎉 React Build Git Hooks have been updated to the latest version!');
console.log('\nChanges in this update:');
console.log('- Fixed infinite build loop issue');
console.log('- Added Husky v10 compatibility');
console.log('- Improved error handling');
console.log('- Added uninstallation options');

rl.close();
