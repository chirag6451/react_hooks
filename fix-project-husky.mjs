#!/usr/bin/env node

/**
 * Script to fix Husky v10 compatibility issues in your project
 * Run this in your project directory where you're having Husky issues
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔧 Fixing Husky hooks for v10 compatibility...');

// Define paths to check
const huskyDir = path.join(process.cwd(), '.husky');

if (!fs.existsSync(huskyDir)) {
  console.log('❌ No .husky directory found. Creating one...');
  fs.mkdirSync(huskyDir, { recursive: true });
}

// Check for pre-commit hook
const preCommitPath = path.join(huskyDir, 'pre-commit');
const preCommitContent = `#!/bin/sh

# Check .gitignore for sensitive files
npm run check-gitignore

# Run build for React apps
npm run build:dev
`;

// Write the updated pre-commit hook
fs.writeFileSync(preCommitPath, preCommitContent);
fs.chmodSync(preCommitPath, '755');
console.log('✅ Created/fixed pre-commit hook for Husky v10 compatibility');

// Check if package.json has the check-gitignore script
try {
  const packageJsonPath = path.join(process.cwd(), 'package.json');
  
  if (!fs.existsSync(packageJsonPath)) {
    console.error('❌ No package.json found in this directory.');
    console.log('Please run this script in your project root directory.');
    process.exit(1);
  }
  
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  
  if (!packageJson.scripts) {
    packageJson.scripts = {};
  }
  
  let scriptsUpdated = false;
  
  // Add check-gitignore script if missing
  if (!packageJson.scripts['check-gitignore']) {
    console.log('🔍 Adding missing check-gitignore script to package.json...');
    
    // Create scripts directory if it doesn't exist
    const scriptsDir = path.join(process.cwd(), 'scripts');
    if (!fs.existsSync(scriptsDir)) {
      fs.mkdirSync(scriptsDir, { recursive: true });
    }
    
    // Check if check-gitignore.js exists, if not create it
    const checkGitignorePath = path.join(scriptsDir, 'check-gitignore.js');
    if (!fs.existsSync(checkGitignorePath)) {
      console.log('📝 Creating check-gitignore.js script...');
      const checkGitignoreContent = `// Script to check and update .gitignore file
import fs from 'fs';
import path from 'path';

console.log('🔍 Checking .gitignore file...');

// Path to .gitignore file
const gitignorePath = path.join(process.cwd(), '.gitignore');

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
  if (existingContent && !existingContent.endsWith('\\n')) {
    additions += '\\n';
  }
  additions += '# Added by React Build Git Hooks\\n';
  
  // Add each missing pattern
  for (const pattern of missingPatterns) {
    additions += pattern + '\\n';
  }
  
  // Write the updated content
  fs.writeFileSync(gitignorePath, existingContent + additions);
  console.log('✅ .gitignore updated successfully!');
} else {
  console.log('✅ .gitignore already contains all essential patterns.');
}
`;
      fs.writeFileSync(checkGitignorePath, checkGitignoreContent);
      fs.chmodSync(checkGitignorePath, '755');
    }
    
    packageJson.scripts['check-gitignore'] = 'node scripts/check-gitignore.js';
    scriptsUpdated = true;
  }
  
  // Add build:dev script if missing
  if (!packageJson.scripts['build:dev']) {
    console.log('🔍 Adding missing build:dev script to package.json...');
    
    // Create scripts directory if it doesn't exist
    const scriptsDir = path.join(process.cwd(), 'scripts');
    if (!fs.existsSync(scriptsDir)) {
      fs.mkdirSync(scriptsDir, { recursive: true });
    }
    
    // Check if build-react-apps.js exists, if not create it
    const buildReactAppsPath = path.join(scriptsDir, 'build-react-apps.js');
    if (!fs.existsSync(buildReactAppsPath)) {
      console.log('📝 Creating build-react-apps.js script...');
      const buildReactAppsContent = `// Script to build all React apps in the repository
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

console.log('🔍 Looking for React apps to build...');

// Function to check if a directory is a React app
function isReactApp(dir) {
  const packageJsonPath = path.join(dir, 'package.json');
  if (!fs.existsSync(packageJsonPath)) {
    return false;
  }
  
  try {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    // Check for React dependency
    return packageJson.dependencies && 
           (packageJson.dependencies.react || 
            packageJson.devDependencies && packageJson.devDependencies.react);
  } catch (error) {
    return false;
  }
}

// Function to find React apps in a directory (recursive)
function findReactApps(dir, apps = []) {
  if (isReactApp(dir)) {
    apps.push(dir);
    return apps;
  }
  
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isDirectory() && entry.name !== 'node_modules' && entry.name !== '.git') {
        findReactApps(path.join(dir, entry.name), apps);
      }
    }
  } catch (error) {
    // Ignore permission errors
  }
  
  return apps;
}

// Find all React apps
const rootDir = process.cwd();
const reactApps = findReactApps(rootDir);

if (reactApps.length === 0) {
  console.log('ℹ️ No React apps found in the repository.');
  process.exit(0);
}

console.log(\`🔨 Found \${reactApps.length} React app(s). Building...\`);

let buildSuccess = true;

// Build each React app
for (const appDir of reactApps) {
  const relativePath = path.relative(rootDir, appDir);
  console.log(\`\\n📦 Building \${relativePath}...\`);
  
  try {
    // Check if the app has a build script
    const packageJsonPath = path.join(appDir, 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    
    if (packageJson.scripts && packageJson.scripts.build) {
      // Run the build script
      execSync('npm run build', { cwd: appDir, stdio: 'inherit' });
      console.log(\`✅ Successfully built \${relativePath}\`);
    } else {
      console.log(\`⚠️ No build script found in \${relativePath}\`);
    }
  } catch (error) {
    console.error(\`❌ Failed to build \${relativePath}: \${error.message}\`);
    buildSuccess = false;
  }
}

if (!buildSuccess) {
  console.error('\\n❌ One or more builds failed. Please fix the errors before committing.');
  process.exit(1);
}

console.log('\\n🎉 All builds completed successfully!');
`;
      fs.writeFileSync(buildReactAppsPath, buildReactAppsContent);
      fs.chmodSync(buildReactAppsPath, '755');
    }
    
    packageJson.scripts['build:dev'] = 'node scripts/build-react-apps.js';
    scriptsUpdated = true;
  }
  
  if (scriptsUpdated) {
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
    console.log('✅ Updated package.json with required scripts');
  } else {
    console.log('ℹ️ All required scripts already exist in package.json');
  }
  
  // Make sure husky is installed
  if (!packageJson.devDependencies || !packageJson.devDependencies.husky) {
    console.log('⚠️ Husky is not listed as a dev dependency in package.json.');
    console.log('Please run: npm install husky --save-dev');
  }
  
} catch (error) {
  console.error('❌ Failed to update package.json:', error.message);
}

console.log('\n🎉 Husky hooks fixed for v10 compatibility!');
console.log('\n📋 Next steps:');
console.log('1. Run: npm install');
console.log('2. Try committing again');
