const fs = require('fs');
const path = require('path');

function walk(dir, regex, replacement) {
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      if (file !== 'node_modules' && file !== '.next') {
        walk(filePath, regex, replacement);
      }
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      const content = fs.readFileSync(filePath, 'utf8');
      const newContent = content.replace(regex, replacement);
      if (content !== newContent) {
        fs.writeFileSync(filePath, newContent, 'utf8');
        console.log('Updated', filePath);
      }
    }
  }
}

walk('./app', /\/caregiver/g, '/supporter');
walk('./components', /\/caregiver/g, '/supporter');
console.log('Done');
