/**
 * Configuration file for React Build Git Hooks
 * 
 * This file allows you to customize the behavior of each hook.
 * For each hook, you can set:
 *   - enforce: true/false - Whether to block commits when issues are found
 *   - enabled: true/false - Whether the hook is enabled at all
 */

module.exports = {
  // Build verification hook
  build: {
    enforce: true, // Block commits if build fails
    enabled: true  // Enable build verification
  },
  
  // Gitignore check hook
  gitignore: {
    enforce: true, // Block commits if .gitignore is missing essential patterns
    enabled: true  // Enable gitignore check
  },
  
  // Lowercase check hook
  lowercase: {
    enforce: false, // Only warn about uppercase file names and imports
    enabled: true   // Enable lowercase check
  },
  
  // Git reminder hook
  gitReminder: {
    enforce: false, // Only provide reminders, don't block commits
    enabled: true,  // Enable git reminders
    
    // Additional settings for git reminder
    settings: {
      hoursThreshold: 4 // Warn if last commit was more than 4 hours ago
    }
  }
};
