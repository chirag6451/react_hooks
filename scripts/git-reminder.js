#!/usr/bin/env node

/**
 * This script reminds users to commit their code regularly
 * and checks for uncommitted changes
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
  const { execSync } = await requireOrImport('child_process');

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
    
    // Display warnings based on the checks
    if (changes) {
      console.warn('\n⚠️ You have uncommitted changes:');
      
      // Show a summary of changes
      const changedFiles = changes.split('\n').length;
      console.warn(`📝 ${changedFiles} file(s) modified`);
      
      // Show actual changes (limited to avoid overwhelming output)
      const statusOutput = execSync('git status -s').toString().trim();
      const statusLines = statusOutput.split('\n');
      
      if (statusLines.length <= 10) {
        console.warn('\nChanged files:');
        statusLines.forEach(line => console.warn(`  ${line}`));
      } else {
        console.warn('\nChanged files (showing first 10):');
        statusLines.slice(0, 10).forEach(line => console.warn(`  ${line}`));
        console.warn(`  ... and ${statusLines.length - 10} more files`);
      }
      
      console.warn('\n👉 Consider committing your changes before continuing.');
    } else {
      console.log('✅ Working directory is clean. No uncommitted changes.');
    }
    
    if (lastCommitTime) {
      const hoursAgo = ((now - lastCommitTime) / (1000 * 60 * 60)).toFixed(1);
      
      if (hoursAgo > 4) {
        console.warn(`\n⏰ It's been ${hoursAgo} hours since your last commit.`);
        console.warn('🧠 Remember to commit often to avoid losing progress!');
      } else {
        console.log(`✅ Last commit was ${hoursAgo} hours ago.`);
      }
      
      // Check if there are any unpulled changes
      try {
        execSync('git fetch --quiet');
        const behindCount = execSync('git rev-list --count HEAD..@{u}').toString().trim();
        
        if (parseInt(behindCount) > 0) {
          console.warn(`\n⚠️ Your branch is behind by ${behindCount} commit(s).`);
          console.warn('👉 Consider running git pull to get the latest changes.');
        }
      } catch (error) {
        // Ignore errors when checking for unpulled changes
        // This can happen if there's no upstream branch
      }
    }
    
    console.log('\n🔍 Git check complete.');
    
  } catch (error) {
    console.error('❌ Error checking Git status:', error.message);
    // Don't exit with error to allow the command to continue
  }
})().catch(error => {
  console.error('❌ Error:', error.message);
  // Don't exit with error to allow the command to continue
});
