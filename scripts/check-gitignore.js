#!/usr/bin/env node

/**
 * This script checks if the .gitignore file contains essential patterns
 * to prevent committing sensitive files
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

  // Load configuration
  let config = {
    gitignore: {
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
  if (!config.gitignore || config.gitignore.enabled === false) {
    console.log('ℹ️ Gitignore check is disabled in hooks-config.js');
    return;
  }

  // Determine if we should enforce or just warn
  const shouldEnforce = config.gitignore && config.gitignore.enforce === true;

  console.log('🔍 Checking .gitignore file...');

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
    'dist',
    'build',
    'coverage'
  ];

  // Check if .gitignore exists
  const gitignorePath = path.join(process.cwd(), '.gitignore');
  let gitignoreContent = '';

  try {
    gitignoreContent = fs.readFileSync(gitignorePath, 'utf8');
  } catch (error) {
    if (shouldEnforce) {
      console.error('❌ ERROR: .gitignore file not found!');
      console.error('Please create a .gitignore file with essential patterns.');
      console.error('\nRecommended patterns:');
      essentialPatterns.forEach(pattern => console.error(`  ${pattern}`));
      console.error('\nYou can bypass this check with git commit --no-verify, but this is not recommended.');
      console.error('Alternatively, set enforce: false for gitignore in hooks-config.js to make this a warning only.');
      process.exit(1);
    } else {
      console.warn('⚠️ WARNING: .gitignore file not found!');
      console.warn('Consider creating a .gitignore file with essential patterns.');
      console.warn('\nRecommended patterns:');
      essentialPatterns.forEach(pattern => console.warn(`  ${pattern}`));
      console.warn('\nThis is just a warning and will not prevent your commit.');
      console.warn('To enforce gitignore checks, set enforce: true for gitignore in hooks-config.js.');
      return;
    }
  }

  // Check if all essential patterns are in .gitignore
  const missingPatterns = [];

  essentialPatterns.forEach(pattern => {
    // Check if pattern is in .gitignore
    // We need to handle comments and empty lines
    const lines = gitignoreContent.split('\n');
    const patternFound = lines.some(line => {
      const trimmedLine = line.trim();
      return trimmedLine === pattern || trimmedLine.startsWith(`${pattern}/`);
    });

    if (!patternFound) {
      missingPatterns.push(pattern);
    }
  });

  if (missingPatterns.length > 0) {
    if (shouldEnforce) {
      console.error('❌ ERROR: .gitignore is missing essential patterns:');
      missingPatterns.forEach(pattern => console.error(`  ${pattern}`));
      console.error('\nPlease add these patterns to your .gitignore file.');
      console.error('You can bypass this check with git commit --no-verify, but this is not recommended.');
      console.error('Alternatively, set enforce: false for gitignore in hooks-config.js to make this a warning only.');
      process.exit(1);
    } else {
      console.warn('⚠️ WARNING: .gitignore is missing essential patterns:');
      missingPatterns.forEach(pattern => console.warn(`  ${pattern}`));
      console.warn('\nConsider adding these patterns to your .gitignore file.');
      console.warn('This is just a warning and will not prevent your commit.');
      console.warn('To enforce gitignore checks, set enforce: true for gitignore in hooks-config.js.');
    }
  } else {
    console.log('✅ .gitignore already contains all essential patterns.');
  }
})().catch(error => {
  console.error('❌ Error:', error.message);
  // Don't exit with error to allow the command to continue
});
