const fs = require('fs');
const path = require('path');

// Ensure dist directories exist
const distDir = path.join(__dirname, 'dist');
const gcDir = path.join(distDir, 'general-controller');
const filesDir = path.join(gcDir, 'files');

if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir);
}
if (!fs.existsSync(gcDir)) {
  fs.mkdirSync(gcDir);
}
if (!fs.existsSync(filesDir)) {
  fs.mkdirSync(filesDir);
}

// Copy schema.json
fs.copyFileSync(
  path.join(__dirname, 'src', 'general-controller', 'schema.json'),
  path.join(gcDir, 'schema.json')
);

// Copy template files
const srcFilesDir = path.join(__dirname, 'src', 'general-controller', 'files');
const files = fs.readdirSync(srcFilesDir);
files.forEach(file => {
  fs.copyFileSync(
    path.join(srcFilesDir, file),
    path.join(filesDir, file)
  );
});

console.log('Assets copied successfully!');