const fs = require('fs');
const path = require('path');

// Helper to copy directory recursively
function copyDir(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  
  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

console.log('🏗️  Preparing standalone build for hosting...');

const standaloneDir = path.join(__dirname, '..', '.next', 'standalone');
const publicDir = path.join(__dirname, '..', 'public');
const staticDir = path.join(__dirname, '..', '.next', 'static');

// 1. Copy public folder
console.log('📂 Copying public folder...');
if (fs.existsSync(publicDir)) {
  copyDir(publicDir, path.join(standaloneDir, 'public'));
}

// 2. Copy .next/static folder
console.log('bm Copying .next/static folder...');
if (fs.existsSync(staticDir)) {
  copyDir(staticDir, path.join(standaloneDir, '.next', 'static'));
}

console.log('✅ Build prepared at .next/standalone');
console.log('📦 You can now zip the contents of .next/standalone and upload to your host.');
