#!/usr/bin/env node

/**
 * Script to uninstall React Build Git Hooks
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

console.log('🔧 Uninstalling React Build Git Hooks...');

// Check if git is initialized
try {
  execSync('git rev-parse --is-inside-work-tree');
} catch (error) {
  console.error('❌ This directory is not a Git repository. Please run this script from a Git repository.');
  process.exit(1);
}

// Ask for confirmation
rl.question('\n⚠️ This will remove all Git hooks set up by React Build Git Hooks. Are you sure? (y/n): ', (answer) => {
  if (answer.toLowerCase() !== 'y' && answer.toLowerCase() !== 'yes') {
    console.log('Uninstallation cancelled.');
    rl.close();
    return;
  }
  
  // Remove hooks
  const hooksToRemove = ['pre-commit', 'pre-push'];
  let hooksRemoved = 0;
  
  for (const hook of hooksToRemove) {
    const hookPath = path.join('.husky', hook);
    if (fs.existsSync(hookPath)) {
      try {
        // Read the hook content to check if it's our hook
        const hookContent = fs.readFileSync(hookPath, 'utf8');
        if (hookContent.includes('npm run check-gitignore') || 
            hookContent.includes('npm run build:dev')) {
          fs.unlinkSync(hookPath);
          console.log(`✅ Removed ${hook} hook`);
          hooksRemoved++;
        } else {
          console.log(`ℹ️ Skipped ${hook} hook as it appears to be custom`);
        }
      } catch (error) {
        console.error(`❌ Failed to remove ${hook} hook:`, error.message);
      }
    }
  }
  
  // Update package.json to remove our scripts
  try {
    const packageJsonPath = 'package.json';
    if (fs.existsSync(packageJsonPath)) {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      
      let scriptsModified = false;
      
      if (packageJson.scripts) {
        // Check if our scripts exist and remove them
        if (packageJson.scripts['check-gitignore']) {
          delete packageJson.scripts['check-gitignore'];
          scriptsModified = true;
        }
        
        if (packageJson.scripts['build:dev']) {
          delete packageJson.scripts['build:dev'];
          scriptsModified = true;
        }
        
        if (scriptsModified) {
          fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
          console.log('✅ Removed scripts from package.json');
        }
      }
    }
  } catch (error) {
    console.error('❌ Failed to update package.json:', error.message);
  }
  
  // Remove script files
  const scriptsDir = 'scripts';
  if (fs.existsSync(scriptsDir)) {
    const filesToRemove = ['build-react-apps.js', 'check-gitignore.js'];
    for (const file of filesToRemove) {
      const filePath = path.join(scriptsDir, file);
      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
          console.log(`✅ Removed ${file}`);
        } catch (error) {
          console.error(`❌ Failed to remove ${file}:`, error.message);
        }
      }
    }
    
    // Check if scripts directory is empty and remove it if it is
    try {
      const files = fs.readdirSync(scriptsDir);
      if (files.length === 0) {
        fs.rmdirSync(scriptsDir);
        console.log('✅ Removed empty scripts directory');
      }
    } catch (error) {
      // Ignore errors when checking directory
    }
  }
  
  if (hooksRemoved > 0) {
    console.log('\n🎉 Successfully uninstalled React Build Git Hooks!');
  } else {
    console.log('\nℹ️ No hooks were found to uninstall.');
  }
  
  rl.close();
});
