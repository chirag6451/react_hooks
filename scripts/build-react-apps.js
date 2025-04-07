#!/usr/bin/env node

/**
 * This script finds all React apps in the repository and runs their build commands
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Get the git root directory
const gitRootDir = execSync('git rev-parse --show-toplevel').toString().trim();

// Function to find all package.json files
function findPackageJsonFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory() && file !== 'node_modules' && file !== '.git') {
      findPackageJsonFiles(filePath, fileList);
    } else if (file === 'package.json') {
      fileList.push(dir);
    }
  });
  
  return fileList;
}

// Find all React apps (directories with package.json that have react as a dependency)
function findReactApps() {
  const packageDirs = findPackageJsonFiles(gitRootDir);
  const reactApps = [];
  
  packageDirs.forEach(dir => {
    try {
      const packageJson = JSON.parse(fs.readFileSync(path.join(dir, 'package.json'), 'utf8'));
      
      // Check if it's a React app
      if (
        (packageJson.dependencies && packageJson.dependencies.react) ||
        (packageJson.devDependencies && packageJson.devDependencies.react)
      ) {
        // Check if it has a build script
        if (packageJson.scripts && packageJson.scripts.build) {
          reactApps.push({
            dir,
            buildScript: 'build'
          });
        }
      }
    } catch (error) {
      console.error(`Error processing ${dir}/package.json:`, error.message);
    }
  });
  
  return reactApps;
}

// Main function to build all React apps
function buildReactApps() {
  console.log('🔍 Finding React apps in the repository...');
  const reactApps = findReactApps();
  
  if (reactApps.length === 0) {
    console.log('⚠️ No React apps found with build scripts.');
    return true;
  }
  
  console.log(`🚀 Found ${reactApps.length} React app(s). Building...`);
  
  let allBuildsSuccessful = true;
  
  reactApps.forEach(app => {
    console.log(`\n📦 Building ${path.relative(gitRootDir, app.dir)} (npm run ${app.buildScript})`);
    
    try {
      // Use direct npm command to avoid recursive calls
      execSync(`cd "${app.dir}" && npm run ${app.buildScript}`, { stdio: 'inherit' });
      console.log(`✅ Build successful for ${path.relative(gitRootDir, app.dir)}`);
    } catch (error) {
      console.error(`❌ Build failed for ${path.relative(gitRootDir, app.dir)}`);
      allBuildsSuccessful = false;
    }
  });
  
  if (allBuildsSuccessful) {
    console.log('\n✅ All React apps built successfully!');
    return true;
  } else {
    console.error('\n❌ Some builds failed. Please fix the issues before committing.');
    return false;
  }
}

// Run the build process and exit with appropriate code
if (!buildReactApps()) {
  process.exit(1);
}
