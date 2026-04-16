const fs = require('fs');
const path = require('path');

const replacements = {
  'text-text-family-primary': 'text-text-primary',
  'text-text-family-secondary': 'text-text-secondary',
  'bg-family-primary-fixed/30': 'bg-family-primary/10',
  'text-on-primary-fixed': 'text-family-primary',
  'text-on-primary-fixed-variant': 'text-text-secondary',
  'bg-secondary-container/30': 'bg-surface-muted',
  'text-on-secondary-container': 'text-text-secondary',
  'bg-status-alert-container': 'bg-status-alert/10',
  'text-on-error-container': 'text-status-alert',
  'shadow-error/20': 'shadow-ambient',
  'text-2xl': 'text-lg', // denser layouts
  'min-h-[120px]': 'min-h-[80px]',
  'rounded-4xl border border-white bg-white/80 p-6 shadow-xl shadow-family-primary/5 backdrop-blur-xl md:p-8': 'bg-surface rounded-2xl p-4 md:p-6 shadow-card border border-border',
  'h-16': 'h-12', // denser inputs
  'text-xl': 'text-lg',
  'rounded-3xl': 'rounded-xl',
  'rounded-2xl': 'rounded-xl',
  'bg-white': 'bg-surface',
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
      // specific long string replacement
      content = content.replace('rounded-4xl border border-white bg-white/80 p-6 shadow-xl shadow-family-primary/5 backdrop-blur-xl md:p-8', 'bg-surface rounded-xl p-4 md:p-6 shadow-card border border-border');
      
      if (content !== originalContent) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated: ${filePath}`);
      }
    });
  });
}

processFiles();
