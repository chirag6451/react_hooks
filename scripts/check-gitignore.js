#!/usr/bin/env node

/**
 * This script checks if the .gitignore file contains all essential patterns
 * and add them if they're missing.
 */

// Module-agnostic imports (works in both CommonJS and ES Module environments)
const requireOrImport = async (moduleName) => {
  try {
    // Check if we're in an ES module environment
    if (typeof require !== 'undefined') {
      // CommonJS environment
      return require(moduleName);
    } else {
      // ES Module environment
      return await import(moduleName);
    }
  } catch (error) {
    console.error(`Error importing module ${moduleName}:`, error.message);
    process.exit(1);
  }
};

// Self-invoking async function to allow top-level await
(async () => {
  // Import modules dynamically
  const fs = await requireOrImport('fs');
  const path = await requireOrImport('path');
  const { execSync } = await requireOrImport('child_process');

  console.log('🔍 Checking .gitignore file...');

  // Get the git root directory
  const gitRootDir = execSync('git rev-parse --show-toplevel').toString().trim();

  // Path to .gitignore file
  const gitignorePath = path.join(gitRootDir, '.gitignore');

  // Essential patterns that should be in .gitignore
  const essentialPatterns = [
    'node_modules',
    '.env',
    '.env.local',
    '.env.development.local',
    '.env.test.local',
    '.env.production.local',
    'npm-debug.log*',
    'yarn-debug.log*',
    'yarn-error.log*',
    '.DS_Store',
    'build',
    'dist',
    'coverage'
  ];

  // Read existing .gitignore or create a new one
  let existingContent = '';
  if (fs.existsSync(gitignorePath)) {
    existingContent = fs.readFileSync(gitignorePath, 'utf8');
  } else {
    console.log('⚠️ No .gitignore found. Creating a new one...');
  }

  // Check which patterns are missing
  const missingPatterns = [];
  for (const pattern of essentialPatterns) {
    if (!existingContent.includes(pattern)) {
      missingPatterns.push(pattern);
    }
  }

  // Add missing patterns if any
  if (missingPatterns.length > 0) {
    console.log('⚠️ Adding missing patterns to .gitignore:', missingPatterns.join(', '));
    
    // Add a header for our additions
    let additions = '';
    if (existingContent && !existingContent.endsWith('\n')) {
      additions += '\n';
    }
    additions += '# Added by React Build Git Hooks\n';
    
    // Add each missing pattern
    for (const pattern of missingPatterns) {
      additions += pattern + '\n';
    }
    
    // Write the updated content
    fs.writeFileSync(gitignorePath, existingContent + additions);
    console.log('✅ .gitignore updated successfully!');
  } else {
    console.log('✅ .gitignore already contains all essential patterns.');
  }
})().catch(error => {
  console.error('❌ Error:', error.message);
  process.exit(1);
});
