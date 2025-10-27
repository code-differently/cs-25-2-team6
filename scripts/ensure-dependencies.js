// Preinstall script to ensure dotenv is available
const fs = require('fs');
const path = require('path');

// Function to check if dotenv is already installed
function isDotenvInstalled() {
  try {
    const packageJsonPath = path.join(process.cwd(), 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    
    // Check if dotenv is in dependencies or devDependencies
    return (
      (packageJson.dependencies && packageJson.dependencies.dotenv) ||
      (packageJson.devDependencies && packageJson.devDependencies.dotenv)
    );
  } catch (error) {
    console.error('Error checking for dotenv:', error);
    return false;
  }
}

// Install dotenv if it's not already installed
if (!isDotenvInstalled()) {
  console.log('Installing dotenv dependency for Vercel deployment...');
  const { execSync } = require('child_process');
  
  try {
    execSync('npm install dotenv --save --no-audit --no-fund', { 
      stdio: 'inherit',
      env: process.env
    });
    console.log('✅ Dotenv installed successfully');
  } catch (error) {
    console.error('❌ Failed to install dotenv:', error);
    process.exit(1);
  }
} else {
  console.log('✅ Dotenv is already installed');
}
