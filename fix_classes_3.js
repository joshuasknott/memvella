const fs = require('fs');
const path = require('path');

const replacements = {
  'text-gray-900': 'text-text-primary',
  'text-gray-800': 'text-text-primary',
  'text-gray-700': 'text-text-secondary',
  'text-gray-600': 'text-text-secondary',
  'text-gray-500': 'text-text-secondary',
  'text-gray-400': 'text-text-secondary',
  'text-red-600': 'text-status-alert',
  'text-red-500': 'text-status-alert',
  'bg-gray-50': 'bg-surface-muted',
  'bg-gray-100': 'bg-surface-muted',
  'border-gray-200': 'border-border',
  'border-gray-100': 'border-border',
  'text-primary': 'text-family-primary', // just in case
  'fill-primary': 'fill-family-primary'
};

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

function processFiles() {
  const dirs = [
    'apps/core/app/circle',
    'apps/core/app/onboarding',
    'apps/core/app/organiser',
    'apps/core/components'
  ];
  
  dirs.forEach(dir => {
    const fullPath = path.resolve(process.cwd(), dir);
    if (!fs.existsSync(fullPath)) return;
    
    walkDir(fullPath, (filePath) => {
      if (!filePath.endsWith('.tsx') && !filePath.endsWith('.ts')) return;
      
      let content = fs.readFileSync(filePath, 'utf8');
      let originalContent = content;
      
      Object.keys(replacements).forEach(key => {
        const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(`\\b${escapedKey}\\b`, 'g');
        content = content.replace(regex, replacements[key]);
      });
      
      if (content !== originalContent) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated: ${filePath}`);
      }
    });
  });
}

processFiles();