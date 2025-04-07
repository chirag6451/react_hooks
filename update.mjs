#!/usr/bin/env node

/**
 * Script to update React Build Git Hooks to the latest version
 * ES Module version for projects with "type": "module" in package.json
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import readline from 'readline';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
const tempDir = path.join(process.cwd(), '.temp-update');
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

// Copy the latest script files and convert them to ES modules
try {
  const scriptsDir = path.join(process.cwd(), 'scripts');
  if (!fs.existsSync(scriptsDir)) {
    fs.mkdirSync(scriptsDir, { recursive: true });
  }
  
  const sourceDir = path.join(tempDir, 'scripts');
  
  // Copy scripts
  fs.copyFileSync(
    path.join(sourceDir, 'build-react-apps.js'),
    path.join(scriptsDir, 'build-react-apps.js')
  );

  fs.copyFileSync(
    path.join(sourceDir, 'check-gitignore.js'),
    path.join(scriptsDir, 'check-gitignore.js')
  );

  fs.copyFileSync(
    path.join(sourceDir, 'check-lowercase.js'),
    path.join(scriptsDir, 'check-lowercase.js')
  );

  fs.copyFileSync(
    path.join(sourceDir, 'git-reminder.js'),
    path.join(scriptsDir, 'git-reminder.js')
  );

  // Create templates directory if it doesn't exist
  const templatesDir = path.join(process.cwd(), 'templates');
  if (!fs.existsSync(templatesDir)) {
    fs.mkdirSync(templatesDir, { recursive: true });
  }

  // Copy templates
  fs.copyFileSync(
    path.join(sourceDir, 'templates', 'pre-commands.js'),
    path.join(templatesDir, 'pre-commands.js')
  );

  // Copy configuration files (don't overwrite existing ones)
  const configJsPath = path.join(process.cwd(), 'hooks-config.js');
  if (!fs.existsSync(configJsPath)) {
    fs.copyFileSync(
      path.join(sourceDir, 'hooks-config.js'),
      configJsPath
    );
    console.log('✅ Created hooks-config.js configuration file');
  } else {
    console.log('ℹ️ Existing hooks-config.js file preserved');
  }

  const configMjsPath = path.join(process.cwd(), 'hooks-config.mjs');
  if (!fs.existsSync(configMjsPath)) {
    fs.copyFileSync(
      path.join(sourceDir, 'hooks-config.mjs'),
      configMjsPath
    );
    console.log('✅ Created hooks-config.mjs configuration file');
  } else {
    console.log('ℹ️ Existing hooks-config.mjs file preserved');
  }

  // Make scripts executable
  try {
    fs.chmodSync(path.join(scriptsDir, 'build-react-apps.js'), '755');
    fs.chmodSync(path.join(scriptsDir, 'check-gitignore.js'), '755');
    fs.chmodSync(path.join(scriptsDir, 'check-lowercase.js'), '755');
    fs.chmodSync(path.join(scriptsDir, 'git-reminder.js'), '755');
  } catch (error) {
    console.warn('⚠️ Could not make scripts executable. You may need to do this manually.');
  }
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
