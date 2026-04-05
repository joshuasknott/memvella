/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    const dirPath = path.join(dir, f);
    const isDirectory = fs.statSync(dirPath).isDirectory();
    if (isDirectory) {
      walkDir(dirPath, callback);
      return;
    }

    callback(path.join(dir, f));
  });
}

function processFile(filePath) {
  if (!filePath.endsWith('.tsx') && !filePath.endsWith('.ts')) return;
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  const replacements = [
    { from: /your Supporter account/g, to: 'your Admin account' },
    { from: /Supporter profile/g, to: 'Admin profile' },
    { from: /Supporter name/g, to: 'Admin name' },
    { from: /Supporter alert preferences/g, to: 'Admin alert preferences' },
    { from: /Supporter device/g, to: 'Admin device' },
    { from: /Supporter notifications/g, to: 'Admin notifications' },
    { from: /Supporter queue/g, to: 'Admin queue' },
    { from: /Supporter Insights/g, to: 'Admin Insights' },
    { from: /Supporter tools/g, to: 'Admin tools' },
    { from: /Supporter workspace/g, to: 'Admin workspace' },
    { from: /Supporter view/g, to: 'Admin view' },
    { from: /Supporter dashboard/g, to: 'Admin dashboard' },
    { from: />Supporter</g, to: '>Admin<' },
    { from: /\"Supporter\"/g, to: '\"Admin\"' },
    { from: /FamilySpace/g, to: 'Circle' },
    { from: /Family Space/g, to: 'Circle' },
    { from: /Add Person/g, to: 'Add Profile' },
    
    // Reverse any accidental code replacements
    { from: /useCircleProfile/g, to: 'useFamilySpaceProfile' },
    { from: /CircleProfile/g, to: 'FamilySpaceProfile' },
    { from: /getCircle/g, to: 'getFamilySpace' },
    { from: /updateCircle/g, to: 'updateFamilySpace' },
  ];

  replacements.forEach(({from, to}) => {
    content = content.replace(from, to);
  });

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Updated', filePath);
  }
}

walkDir('app', processFile);
