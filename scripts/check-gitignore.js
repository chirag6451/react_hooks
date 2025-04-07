#!/usr/bin/env node

/**
 * Script to check if sensitive files and directories are properly ignored in .gitignore
 * and add them if they're missing.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Get the git root directory
const gitRootDir = execSync('git rev-parse --show-toplevel').toString().trim();

// Essential patterns that should be in .gitignore
const essentialPatterns = [
  // Node.js
  'node_modules/',
  'npm-debug.log',
  'yarn-debug.log*',
  'yarn-error.log*',
  '.pnpm-debug.log*',
  
  // Environment and secrets
  '.env',
  '.env.local',
  '.env.development.local',
  '.env.test.local',
  '.env.production.local',
  '*.pem',
  '.env*.local',
  
  // IDE and editors
  '.idea/',
  '.vscode/',
  '*.sublime-project',
  '*.sublime-workspace',
  '.DS_Store',
  
  // Build outputs
  '/build',
  '/dist',
  '/.next/',
  '/out/',
  '/.nuxt',
  
  // Coverage and testing
  '/coverage',
  '/.nyc_output',
  
  // Logs
  'logs',
  '*.log',
  
  // Cache
  '.npm',
  '.eslintcache',
  '.stylelintcache',
  '.cache/',
  '.parcel-cache',
  
  // Misc
  '.DS_Store',
  'Thumbs.db'
];

// Path to .gitignore
const gitignorePath = path.join(gitRootDir, '.gitignore');

// Function to check and update .gitignore
function checkAndUpdateGitignore() {
  console.log('🔍 Checking .gitignore for sensitive patterns...');
  
  let existingPatterns = [];
  let gitignoreContent = '';
  
  // Check if .gitignore exists
  if (fs.existsSync(gitignorePath)) {
    gitignoreContent = fs.readFileSync(gitignorePath, 'utf8');
    existingPatterns = gitignoreContent.split('\n').map(line => line.trim());
  } else {
    console.log('⚠️ No .gitignore file found. Creating one...');
  }
  
  // Find missing patterns
  const missingPatterns = essentialPatterns.filter(pattern => 
    !existingPatterns.some(existing => existing === pattern)
  );
  
  if (missingPatterns.length === 0) {
    console.log('✅ All essential patterns are already in .gitignore');
    return true;
  }
  
  // Add missing patterns to .gitignore
  console.log(`⚠️ Adding ${missingPatterns.length} missing patterns to .gitignore:`);
  missingPatterns.forEach(pattern => console.log(`  - ${pattern}`));
  
  // Prepare content to append
  let contentToAppend = '';
  
  if (gitignoreContent && !gitignoreContent.endsWith('\n')) {
    contentToAppend += '\n';
  }
  
  contentToAppend += '\n# Added automatically by git hooks\n';
  contentToAppend += missingPatterns.join('\n');
  contentToAppend += '\n';
  
  // Write to .gitignore
  fs.appendFileSync(gitignorePath, contentToAppend);
  console.log('✅ Updated .gitignore with missing patterns');
  
  // Add the updated .gitignore to git staging
  try {
    execSync(`git add "${gitignorePath}"`, { stdio: 'inherit' });
    console.log('✅ Added updated .gitignore to git staging');
  } catch (error) {
    console.error('❌ Failed to add .gitignore to git staging:', error.message);
  }
  
  return true;
}

// Run the check
if (!checkAndUpdateGitignore()) {
  process.exit(1);
}

process.exit(0);
