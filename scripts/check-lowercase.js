#!/usr/bin/env node

/**
 * This script checks that all staged files have lowercase names
 * and all import statements use lowercase paths
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
  const { execSync } = await requireOrImport('child_process');

  // Load configuration
  let config = {
    lowercase: {
      enforce: false,
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
  if (!config.lowercase || config.lowercase.enabled === false) {
    console.log('ℹ️ Lowercase check is disabled in hooks-config.js');
    return;
  }

  console.log('🔍 Checking for lowercase file names and import statements...');

  // Get staged files (excluding deleted files)
  const stagedFiles = execSync('git diff --cached --name-only --diff-filter=d')
    .toString()
    .trim()
    .split('\n')
    .filter(Boolean); // Remove empty lines

  if (stagedFiles.length === 0) {
    console.log('ℹ️ No staged files found.');
    return;
  }

  // File extensions to check for import statements
  const codeFileExtensions = [
    '.js', '.jsx', '.ts', '.tsx', '.vue', '.svelte', 
    '.mjs', '.cjs', '.mts', '.cts'
  ];

  // Patterns to match import statements
  const importPatterns = [
    /import\s+.*\s+from\s+['"](.+)['"]/g,         // import x from 'path'
    /import\s*\(\s*['"](.+)['"]\s*\)/g,           // import('path')
    /require\s*\(\s*['"](.+)['"]\s*\)/g,          // require('path')
    /import\s+['"](.+)['"]/g,                      // import 'path'
    /export\s+.*\s+from\s+['"](.+)['"]/g,          // export x from 'path'
    /dynamic\s*\(\s*['"](.+)['"]\s*\)/g            // dynamic('path') (Next.js)
  ];

  let hasWarnings = false;
  const warnings = {
    fileNames: [],
    imports: []
  };

  // Check file names
  for (const file of stagedFiles) {
    const fileName = path.basename(file);
    
    // Skip node_modules, build directories, and dot files
    if (file.includes('node_modules/') || 
        file.includes('/build/') || 
        file.includes('/dist/') ||
        fileName.startsWith('.')) {
      continue;
    }
    
    // Check if file name contains uppercase letters
    if (fileName !== fileName.toLowerCase()) {
      warnings.fileNames.push(file);
      hasWarnings = true;
    }
    
    // Check import statements in code files
    const ext = path.extname(file).toLowerCase();
    if (codeFileExtensions.includes(ext)) {
      try {
        const content = fs.readFileSync(file, 'utf8');
        
        for (const pattern of importPatterns) {
          const matches = [...content.matchAll(pattern)];
          
          for (const match of matches) {
            const importPath = match[1];
            
            // Skip package imports, relative path imports without uppercase, and URL imports
            if (!importPath.startsWith('.') || 
                importPath.toLowerCase() === importPath ||
                importPath.startsWith('http://') ||
                importPath.startsWith('https://')) {
              continue;
            }
            
            warnings.imports.push({
              file,
              importPath
            });
            hasWarnings = true;
          }
        }
      } catch (error) {
        console.error(`❌ Error reading file ${file}:`, error.message);
      }
    }
  }

  // Report warnings
  if (hasWarnings) {
    // Determine if we should enforce or just warn based on config
    const shouldEnforce = config.lowercase && config.lowercase.enforce === true;
    
    if (shouldEnforce) {
      console.error('❌ ERROR: Found files that do not follow lowercase naming convention:');
    } else {
      console.warn('⚠️ WARNING: Found files that do not follow lowercase naming convention:');
    }
    
    if (warnings.fileNames.length > 0) {
      console[shouldEnforce ? 'error' : 'warn']('\n📁 Files with uppercase names:');
      warnings.fileNames.forEach(file => {
        console[shouldEnforce ? 'error' : 'warn'](`  - ${file}`);
      });
    }
    
    if (warnings.imports.length > 0) {
      console[shouldEnforce ? 'error' : 'warn']('\n📦 Files with uppercase import paths:');
      warnings.imports.forEach(({ file, importPath }) => {
        console[shouldEnforce ? 'error' : 'warn'](`  - ${file}: import path "${importPath}"`);
      });
    }
    
    if (shouldEnforce) {
      console.error('\n❌ Please rename these files and update import statements to use lowercase.');
      console.error('You can bypass this check with git commit --no-verify, but this is not recommended.');
      console.error('Alternatively, set enforce: false for lowercase in hooks-config.js to make this a warning only.');
      process.exit(1);
    } else {
      console.warn('\n⚠️ Consider renaming these files and updating import statements to use lowercase.');
      console.warn('This is just a warning and will not prevent your commit.');
      console.warn('To enforce lowercase naming, set enforce: true for lowercase in hooks-config.js.');
    }
  } else {
    console.log('✅ All file names and import statements follow lowercase convention.');
  }
})().catch(error => {
  console.error('❌ Error:', error.message);
  // Don't exit with error code to allow commit to proceed
});
