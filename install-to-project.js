/**
 * Script to install React build hooks into an existing project
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🔧 Installing React Build Git Hooks to your project...');

// Check if target directory is provided
const targetDir = process.argv[2] || process.cwd();

// Check if git is initialized in the target directory
try {
  execSync('git rev-parse --is-inside-work-tree', { cwd: targetDir });
} catch (error) {
  console.error(`❌ The directory ${targetDir} is not a Git repository. Please initialize Git first.`);
  process.exit(1);
}

// Check if package.json exists in the target directory
const targetPackageJsonPath = path.join(targetDir, 'package.json');
if (!fs.existsSync(targetPackageJsonPath)) {
  console.error(`❌ No package.json found in ${targetDir}. Please initialize npm first with 'npm init'.`);
  process.exit(1);
}

// Read target package.json
let targetPackageJson;
try {
  targetPackageJson = JSON.parse(fs.readFileSync(targetPackageJsonPath, 'utf8'));
} catch (error) {
  console.error(`❌ Failed to read package.json in ${targetDir}:`, error.message);
  process.exit(1);
}

// Add husky as a dev dependency if not already present
console.log('\n📦 Adding husky to your project...');
try {
  execSync('npm install husky --save-dev', { cwd: targetDir, stdio: 'inherit' });
} catch (error) {
  console.error('❌ Failed to install husky:', error.message);
  process.exit(1);
}

// Create scripts directory if it doesn't exist
const scriptsDir = path.join(targetDir, 'scripts');
if (!fs.existsSync(scriptsDir)) {
  fs.mkdirSync(scriptsDir, { recursive: true });
}

// Copy build-react-apps.js to the target project
fs.copyFileSync(
  path.join(__dirname, 'scripts', 'build-react-apps.js'),
  path.join(scriptsDir, 'build-react-apps.js')
);

// Copy check-gitignore.js to the target project
fs.copyFileSync(
  path.join(__dirname, 'scripts', 'check-gitignore.js'),
  path.join(scriptsDir, 'check-gitignore.js')
);

// Make the scripts executable
try {
  fs.chmodSync(path.join(scriptsDir, 'build-react-apps.js'), '755');
  fs.chmodSync(path.join(scriptsDir, 'check-gitignore.js'), '755');
} catch (error) {
  console.warn('⚠️ Could not make scripts executable. You may need to do this manually.');
}

// Update target package.json
if (!targetPackageJson.scripts) {
  targetPackageJson.scripts = {};
}

// Add prepare and build:dev scripts
targetPackageJson.scripts.prepare = 'husky install';
if (!targetPackageJson.scripts['build:dev']) {
  targetPackageJson.scripts['build:dev'] = 'node scripts/build-react-apps.js';
}
if (!targetPackageJson.scripts['check-gitignore']) {
  targetPackageJson.scripts['check-gitignore'] = 'node scripts/check-gitignore.js';
}

// Write updated package.json
fs.writeFileSync(targetPackageJsonPath, JSON.stringify(targetPackageJson, null, 2));

// Ask which hook type to use
rl.question('\n🤔 Which hook would you like to use?\n1. pre-commit (runs before each commit)\n2. pre-push (runs before each push)\nEnter 1 or 2: ', (answer) => {
  const hookType = answer.trim() === '2' ? 'pre-push' : 'pre-commit';
  
  console.log(`\n🔄 Setting up ${hookType} hook...`);
  
  // Initialize Husky
  try {
    execSync('npx husky install', { cwd: targetDir, stdio: 'inherit' });
  } catch (error) {
    console.error('❌ Failed to initialize Husky:', error.message);
    process.exit(1);
  }
  
  // Add the hooks
  try {
    // Create the hook script content - Updated for Husky v10 compatibility
    const hookScript = `#!/bin/sh

# Check .gitignore for sensitive files
npm run check-gitignore

# Run build for React apps directly
npm run build
`;

    // Create the hook file path
    const huskyDir = path.join(targetDir, '.husky');
    if (!fs.existsSync(huskyDir)) {
      fs.mkdirSync(huskyDir, { recursive: true });
    }
    
    // Write the hook file
    const hookPath = path.join(huskyDir, hookType);
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
