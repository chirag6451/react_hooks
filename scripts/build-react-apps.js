#!/usr/bin/env node

/**
 * This script builds React apps in a monorepo or standalone project
 * It will warn or block commits based on configuration
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
  const { execSync, spawn } = await requireOrImport('child_process');

  // Load configuration
  let config = {
    build: {
      enforce: true,
      enabled: true
    }
  };

  try {
    // Try to load CommonJS config
    if (typeof require !== 'undefined') {
      try {
        const configPath = path.join(process.cwd(), 'hooks-config.js');
        if (fs.existsSync(configPath)) {
          config = require(configPath);
        }
      } catch (error) {
        // Ignore error, use default config
      }
    } else {
      // Try to load ES Module config
      try {
        const configPath = path.join(process.cwd(), 'hooks-config.mjs');
        if (fs.existsSync(configPath)) {
          const importedConfig = await import(configPath);
          config = importedConfig.default;
        }
      } catch (error) {
        // Ignore error, use default config
      }
    }
  } catch (error) {
    // Ignore error, use default config
  }

  // Check if the hook is disabled
  if (!config.build || config.build.enabled === false) {
    console.log('ℹ️ Build verification is disabled in hooks-config.js');
    return;
  }

  // Determine if we should enforce or just warn
  const shouldEnforce = config.build && config.build.enforce === true;

  // Get staged files
  const stagedFiles = execSync('git diff --cached --name-only')
    .toString()
    .trim()
    .split('\n')
    .filter(Boolean);

  // Check if any JS/TS files are staged
  const hasJsChanges = stagedFiles.some(file => 
    /\.(js|jsx|ts|tsx|vue|svelte)$/.test(file) && 
    !file.includes('node_modules/')
  );

  if (!hasJsChanges) {
    console.log('ℹ️ No JavaScript/TypeScript changes detected. Skipping build check.');
    return;
  }

  console.log('🔍 Checking for React apps to build...');

  // Check if this is a monorepo with multiple apps
  const isMonorepo = fs.existsSync('lerna.json') || 
                    (fs.existsSync('package.json') && 
                     JSON.parse(fs.readFileSync('package.json', 'utf8')).workspaces);

  let buildCommand = 'npm run build';
  let buildSuccessful = false;

  try {
    if (isMonorepo) {
      console.log('📦 Detected monorepo structure');
      
      // For monorepos, find affected apps and build them
      let appsToCheck = [];
      
      if (fs.existsSync('lerna.json')) {
        // Lerna monorepo
        const packages = JSON.parse(execSync('npx lerna list --json').toString());
        appsToCheck = packages.map(pkg => pkg.location);
      } else {
        // Yarn/npm workspaces
        const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
        const workspaces = packageJson.workspaces;
        
        if (Array.isArray(workspaces)) {
          // Simple array of workspace patterns
          for (const pattern of workspaces) {
            const matches = execSync(`find ${pattern} -name "package.json" -not -path "*/node_modules/*"`)
              .toString()
              .trim()
              .split('\n')
              .filter(Boolean);
            
            for (const match of matches) {
              appsToCheck.push(path.dirname(match));
            }
          }
        } else if (workspaces && workspaces.packages) {
          // Object with packages array
          for (const pattern of workspaces.packages) {
            const matches = execSync(`find ${pattern} -name "package.json" -not -path "*/node_modules/*"`)
              .toString()
              .trim()
              .split('\n')
              .filter(Boolean);
            
            for (const match of matches) {
              appsToCheck.push(path.dirname(match));
            }
          }
        }
      }
      
      // Filter to only apps with build scripts and affected by staged files
      const appsToBuild = [];
      
      for (const appPath of appsToCheck) {
        const packageJsonPath = path.join(appPath, 'package.json');
        
        if (fs.existsSync(packageJsonPath)) {
          const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
          
          if (packageJson.scripts && packageJson.scripts.build) {
            // Check if any staged files affect this app
            const appRelativePath = path.relative(process.cwd(), appPath);
            const isAffected = stagedFiles.some(file => 
              file.startsWith(appRelativePath) || 
              file.includes('shared') || 
              file.includes('common')
            );
            
            if (isAffected) {
              appsToBuild.push(appPath);
            }
          }
        }
      }
      
      if (appsToBuild.length === 0) {
        console.log('ℹ️ No affected React apps with build scripts found');
        buildSuccessful = true;
      } else {
        console.log(`🏗️ Building ${appsToBuild.length} affected React app(s)...`);
        
        // Build each affected app
        for (const appPath of appsToBuild) {
          const appName = path.basename(appPath);
          console.log(`\n🔨 Building ${appName}...`);
          
          try {
            execSync('npm run build', { 
              cwd: appPath, 
              stdio: 'inherit'
            });
            console.log(`✅ Successfully built ${appName}`);
          } catch (error) {
            if (shouldEnforce) {
              console.error(`\n❌ ERROR: Failed to build ${appName}`);
              console.error('Please fix the build errors before committing.');
              console.error('You can bypass this check with git commit --no-verify, but this is not recommended.');
              console.error('Alternatively, set enforce: false for build in hooks-config.js to make this a warning only.');
              process.exit(1);
            } else {
              console.warn(`\n⚠️ WARNING: Failed to build ${appName}`);
              console.warn('Consider fixing the build errors before committing.');
              console.warn('This is just a warning and will not prevent your commit.');
              console.warn('To enforce build verification, set enforce: true for build in hooks-config.js.');
            }
            return;
          }
        }
        
        buildSuccessful = true;
      }
    } else {
      // Single app
      console.log('🏗️ Building React app...');
      
      // Check if package.json exists and has a build script
      if (fs.existsSync('package.json')) {
        const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
        
        if (packageJson.scripts && packageJson.scripts.build) {
          try {
            execSync('npm run build', { stdio: 'inherit' });
            console.log('✅ Build successful!');
            buildSuccessful = true;
          } catch (error) {
            if (shouldEnforce) {
              console.error('\n❌ ERROR: Build failed!');
              console.error('Please fix the build errors before committing.');
              console.error('You can bypass this check with git commit --no-verify, but this is not recommended.');
              console.error('Alternatively, set enforce: false for build in hooks-config.js to make this a warning only.');
              process.exit(1);
            } else {
              console.warn('\n⚠️ WARNING: Build failed!');
              console.warn('Consider fixing the build errors before committing.');
              console.warn('This is just a warning and will not prevent your commit.');
              console.warn('To enforce build verification, set enforce: true for build in hooks-config.js.');
            }
          }
        } else {
          console.log('ℹ️ No build script found in package.json');
          buildSuccessful = true;
        }
      } else {
        console.log('ℹ️ No package.json found');
        buildSuccessful = true;
      }
    }
    
    if (buildSuccessful) {
      console.log('\n🎉 All builds completed successfully!');
    }
  } catch (error) {
    if (shouldEnforce) {
      console.error('\n❌ ERROR: Failed to check or build React apps:', error.message);
      console.error('You can bypass this check with git commit --no-verify, but this is not recommended.');
      console.error('Alternatively, set enforce: false for build in hooks-config.js to make this a warning only.');
      process.exit(1);
    } else {
      console.warn('\n⚠️ WARNING: Failed to check or build React apps:', error.message);
      console.warn('This is just a warning and will not prevent your commit.');
      console.warn('To enforce build verification, set enforce: true for build in hooks-config.js.');
    }
  }
})().catch(error => {
  console.error('❌ Error:', error.message);
  // Don't exit with error to allow the command to continue
});
