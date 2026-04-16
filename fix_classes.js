const fs = require('fs');
const path = require('path');

const replacements = {
  'bg-surface-container-low': 'bg-surface',
  'bg-surface-container-lowest': 'bg-surface',
  'bg-surface-container-highest': 'bg-surface-muted',
  'bg-surface-container-high': 'bg-surface-muted',
  'bg-surface-container': 'bg-surface-muted',
  'text-on-surface-variant': 'text-text-secondary',
  'text-on-surface': 'text-text-primary',
  'text-outline-variant': 'text-text-secondary',
  'text-outline': 'text-text-secondary',
  'border-outline-variant/30': 'border-border',
  'border-outline-variant/40': 'border-border',
  'border-outline-variant/20': 'border-border',
  'border-outline/50': 'border-border',
  'border-outline-variant': 'border-border',
  'border-outline': 'border-border',
  'bg-secondary-fixed': 'bg-family-primary/10',
  'text-on-secondary-fixed-variant': 'text-family-primary',
  'bg-primary/10': 'bg-family-primary/10',
  'bg-primary/5': 'bg-family-primary/5',
  'text-primary': 'text-family-primary',
  'text-error': 'text-status-alert',
  'bg-error': 'bg-status-alert',
  'bg-primary-container': 'bg-family-primary/10',
  'text-on-primary-container': 'text-family-primary',
  'font-headline': 'font-family',
  'bg-tertiary-fixed': 'bg-family-primary/10',
  'text-on-tertiary-fixed-variant': 'text-family-primary',
  'fill-on-tertiary-fixed-variant': 'fill-family-primary',
  'shadow-primary/5': 'shadow-ambient',
  'shadow-primary/20': 'shadow-ambient',
  'ring-primary': 'ring-family-primary',
  'bg-primary': 'bg-family-primary',
  'text-primary/70': 'text-family-primary/70',
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
        // use regex to replace exact class names, handle slashes if any
        const escapedKey = key.replace(/\//g, '\\/');
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
