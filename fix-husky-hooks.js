#!/usr/bin/env node

/**
 * Script to fix existing Husky hooks for v10 compatibility
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing Husky hooks for v10 compatibility...');

// Define paths to check
const huskyDir = path.join(process.cwd(), '.husky');
const hookTypes = ['pre-commit', 'pre-push'];

if (!fs.existsSync(huskyDir)) {
  console.error('❌ No .husky directory found. Run husky install first.');
  process.exit(1);
}

let fixedCount = 0;

// Fix each hook type if it exists
hookTypes.forEach(hookType => {
  const hookPath = path.join(huskyDir, hookType);
  
  if (fs.existsSync(hookPath)) {
    try {
      let hookContent = fs.readFileSync(hookPath, 'utf8');
      
      // Check if it has the deprecated lines
      if (hookContent.includes('#!/usr/bin/env sh') || 
          hookContent.includes('. "$(dirname -- "$0")/_/husky.sh"') ||
          hookContent.includes('. "$(dirname "$0")/_/husky.sh"')) {
        
        // Create the updated hook content
        const updatedHookContent = `#!/bin/sh

# Check .gitignore for sensitive files
npm run check-gitignore

# Run build for React apps
npm run build:dev
`;
        
        // Write the updated hook
        fs.writeFileSync(hookPath, updatedHookContent);
        fs.chmodSync(hookPath, '755');
        
        console.log(`✅ Fixed ${hookType} hook for Husky v10 compatibility`);
        fixedCount++;
      } else {
        console.log(`ℹ️ ${hookType} hook is already compatible with Husky v10`);
      }
    } catch (error) {
      console.error(`❌ Failed to fix ${hookType} hook:`, error.message);
    }
  }
});

if (fixedCount > 0) {
  console.log('\n🎉 Successfully fixed Husky hooks for v10 compatibility!');
} else {
  console.log('\nℹ️ No hooks needed fixing or no hooks were found.');
}

// Check if package.json has the check-gitignore script
try {
  const packageJsonPath = path.join(process.cwd(), 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  
  if (!packageJson.scripts || !packageJson.scripts['check-gitignore']) {
    console.log('\n🔍 Adding missing check-gitignore script to package.json...');
    
    if (!packageJson.scripts) {
      packageJson.scripts = {};
    }
    
    packageJson.scripts['check-gitignore'] = 'node scripts/check-gitignore.js';
    
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
    console.log('✅ Added check-gitignore script to package.json');
  }
} catch (error) {
  console.error('❌ Failed to update package.json:', error.message);
}

console.log('\n📋 Next steps:');
console.log('1. Run: npm install');
console.log('2. Try committing again');
