const fs = require('fs');
const path = require('path');

const replacements = {
  'text-text-family-primary': 'text-text-primary',
  'text-text-family-secondary': 'text-text-secondary',
  'text-family-primary-fixed': 'text-family-primary'
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
        // Use split/join for global replace without regex boundaries
        content = content.split(key).join(replacements[key]);
      });
      
      if (content !== originalContent) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated: ${filePath}`);
      }
    });
  });
}

processFiles();