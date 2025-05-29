const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🧹 Starting cleanup process...');

// Function to force delete directory on Windows
function forceDeleteDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    console.log(`✅ Directory ${dirPath} doesn't exist, skipping...`);
    return;
  }

  console.log(`🗑️  Attempting to delete ${dirPath}...`);
  
  try {
    // Method 1: Try normal deletion
    fs.rmSync(dirPath, { recursive: true, force: true });
    console.log(`✅ Successfully deleted ${dirPath}`);
    return;
  } catch (error) {
    console.log(`⚠️  Normal deletion failed: ${error.message}`);
  }

  // Method 2: Try with process termination first
  try {
    console.log('🔄 Terminating Node.js processes...');
    if (process.platform === 'win32') {
      execSync('taskkill /f /im node.exe 2>nul || echo "No Node.js processes found"', { stdio: 'inherit' });
    } else {
      execSync('pkill -f node 2>/dev/null || echo "No Node.js processes found"', { stdio: 'inherit' });
    }
    
    // Wait a bit for processes to terminate
    setTimeout(() => {
      try {
        fs.rmSync(dirPath, { recursive: true, force: true });
        console.log(`✅ Successfully deleted ${dirPath} after process termination`);
        return;
      } catch (error) {
        console.log(`⚠️  Still failed after process termination: ${error.message}`);
        
        // Method 3: Windows-specific robocopy method
        if (process.platform === 'win32') {
          try {
            console.log('🔄 Trying Windows robocopy method...');
            const tempDir = path.join(require('os').tmpdir(), `empty_${Date.now()}`);
            fs.mkdirSync(tempDir, { recursive: true });
            
            execSync(`robocopy "${tempDir}" "${dirPath}" /MIR /R:0 /W:0`, { stdio: 'ignore' });
            fs.rmSync(dirPath, { force: true });
            fs.rmSync(tempDir, { force: true });
            
            console.log(`✅ Successfully deleted ${dirPath} using robocopy method`);
          } catch (robocopyError) {
            console.log(`❌ Robocopy method also failed: ${robocopyError.message}`);
            console.log(`⚠️  Manual deletion may be required for ${dirPath}`);
          }
        }
      }
    }, 2000);
  } catch (processError) {
    console.log(`⚠️  Process termination failed: ${processError.message}`);
  }
}

// Clean up directories
const dirsToClean = [
  '.next',
  'node_modules/.cache',
  'dist',
  'out'
];

dirsToClean.forEach(dir => {
  forceDeleteDir(path.resolve(dir));
});

// Clean npm cache
try {
  console.log('🧹 Cleaning npm cache...');
  execSync('npm cache clean --force', { stdio: 'inherit' });
  console.log('✅ npm cache cleaned');
} catch (error) {
  console.log(`⚠️  npm cache clean failed: ${error.message}`);
}

console.log('🎉 Cleanup process completed!'); 