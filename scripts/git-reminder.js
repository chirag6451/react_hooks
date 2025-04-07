#!/usr/bin/env node

/**
 * This script reminds users to commit their code regularly
 * and checks for uncommitted changes
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
    gitReminder: {
      enforce: false,
      enabled: true,
      settings: {
        hoursThreshold: 4
      }
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
  if (!config.gitReminder || config.gitReminder.enabled === false) {
    console.log('ℹ️ Git reminder is disabled in hooks-config.js');
    return;
  }

  // Get the hours threshold from config
  const hoursThreshold = config.gitReminder.settings?.hoursThreshold || 4;
  
  // Determine if we should enforce or just warn
  const shouldEnforce = config.gitReminder && config.gitReminder.enforce === true;

  console.log('🔍 Checking Git status...');

  try {
    // Check if we're in a Git repository
    try {
      execSync('git rev-parse --is-inside-work-tree', { stdio: 'ignore' });
    } catch (error) {
      console.log('ℹ️ Not in a Git repository. Skipping Git checks.');
      return;
    }

    // Check for uncommitted changes
    const changes = execSync('git status --porcelain').toString().trim();
    
    // Get last commit time
    let lastCommitTime;
    try {
      const lastCommit = execSync('git log -1 --format=%ct').toString().trim();
      lastCommitTime = new Date(parseInt(lastCommit) * 1000);
    } catch (error) {
      // No commits yet
      console.log('ℹ️ No commits found in this repository yet.');
      lastCommitTime = null;
    }
    
    const now = new Date();
    let hasIssues = false;
    
    // Display warnings based on the checks
    if (changes) {
      if (shouldEnforce) {
        console.error('\n❌ ERROR: You have uncommitted changes:');
      } else {
        console.warn('\n⚠️ You have uncommitted changes:');
      }
      
      // Show a summary of changes
      const changedFiles = changes.split('\n').length;
      console[shouldEnforce ? 'error' : 'warn'](`📝 ${changedFiles} file(s) modified`);
      
      // Show actual changes (limited to avoid overwhelming output)
      const statusOutput = execSync('git status -s').toString().trim();
      const statusLines = statusOutput.split('\n');
      
      if (statusLines.length <= 10) {
        console[shouldEnforce ? 'error' : 'warn']('\nChanged files:');
        statusLines.forEach(line => console[shouldEnforce ? 'error' : 'warn'](`  ${line}`));
      } else {
        console[shouldEnforce ? 'error' : 'warn']('\nChanged files (showing first 10):');
        statusLines.slice(0, 10).forEach(line => console[shouldEnforce ? 'error' : 'warn'](`  ${line}`));
        console[shouldEnforce ? 'error' : 'warn'](`  ... and ${statusLines.length - 10} more files`);
      }
      
      if (shouldEnforce) {
        console.error('\n❌ Please commit your changes before continuing.');
        hasIssues = true;
      } else {
        console.warn('\n👉 Consider committing your changes before continuing.');
      }
    } else {
      console.log('✅ Working directory is clean. No uncommitted changes.');
    }
    
    if (lastCommitTime) {
      const hoursAgo = ((now - lastCommitTime) / (1000 * 60 * 60)).toFixed(1);
      
      if (hoursAgo > hoursThreshold) {
        if (shouldEnforce) {
          console.error(`\n❌ ERROR: It's been ${hoursAgo} hours since your last commit.`);
          console.error('You should commit more frequently to avoid losing progress!');
          hasIssues = true;
        } else {
          console.warn(`\n⏰ It's been ${hoursAgo} hours since your last commit.`);
          console.warn('🧠 Remember to commit often to avoid losing progress!');
        }
      } else {
        console.log(`✅ Last commit was ${hoursAgo} hours ago.`);
      }
      
      // Check if there are any unpulled changes
      try {
        execSync('git fetch --quiet');
        const behindCount = execSync('git rev-list --count HEAD..@{u}').toString().trim();
        
        if (parseInt(behindCount) > 0) {
          if (shouldEnforce) {
            console.error(`\n❌ ERROR: Your branch is behind by ${behindCount} commit(s).`);
            console.error('You should pull the latest changes before continuing.');
            hasIssues = true;
          } else {
            console.warn(`\n⚠️ Your branch is behind by ${behindCount} commit(s).`);
            console.warn('👉 Consider running git pull to get the latest changes.');
          }
        }
      } catch (error) {
        // Ignore errors when checking for unpulled changes
        // This can happen if there's no upstream branch
      }
    }
    
    console.log('\n🔍 Git check complete.');
    
    // Exit with error if we should enforce and have issues
    if (shouldEnforce && hasIssues) {
      console.error('\n❌ Git checks failed. Please fix the issues before continuing.');
      console.error('You can bypass this check with git commit --no-verify, but this is not recommended.');
      console.error('Alternatively, set enforce: false for gitReminder in hooks-config.js to make this a warning only.');
      process.exit(1);
    }
    
  } catch (error) {
    console.error('❌ Error checking Git status:', error.message);
    // Don't exit with error to allow the command to continue
  }
})().catch(error => {
  console.error('❌ Error:', error.message);
  // Don't exit with error to allow the command to continue
});
