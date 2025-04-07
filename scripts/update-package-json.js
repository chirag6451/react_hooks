#!/usr/bin/env node

/**
 * Helper script to update package.json for Windows batch installer
 */

const fs = require('fs');
const path = require('path');

// Get package.json path from command line argument
const packageJsonPath = process.argv[2];

if (!packageJsonPath) {
  console.error('Error: No package.json path provided');
  process.exit(1);
}

try {
  // Read package.json
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  
  // Initialize scripts object if it doesn't exist
  if (!packageJson.scripts) {
    packageJson.scripts = {};
  }
  
  // Add required scripts
  packageJson.scripts.prepare = 'husky install';
  
  if (!packageJson.scripts['build:dev']) {
    packageJson.scripts['build:dev'] = 'node scripts/build-react-apps.js';
  }
  
  if (!packageJson.scripts['check-gitignore']) {
    packageJson.scripts['check-gitignore'] = 'node scripts/check-gitignore.js';
  }
  
  // Write updated package.json
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
  console.log('✅ Successfully updated package.json');
  
} catch (error) {
  console.error('❌ Failed to update package.json:', error.message);
  process.exit(1);
}
