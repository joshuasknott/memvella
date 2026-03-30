const fs = require('fs'); 
const path = require('path'); 
const banned = ['caregiver', 'care circle', 'patient', 'sufferer', 'dementia', 'loved one']; 
function walk(dir) { 
    if (!fs.existsSync(dir)) return [];
    let results = []; 
    const list = fs.readdirSync(dir); 
    list.forEach(file => { 
        const filePath = path.join(dir, file); 
        const stat = fs.statSync(filePath); 
        if (stat && stat.isDirectory()) { 
            if (file !== 'node_modules' && file !== '.next' && file !== '.git') {
                results = results.concat(walk(filePath)); 
            }
        } else if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) { 
            const content = fs.readFileSync(filePath, 'utf8').toLowerCase(); 
            banned.forEach(word => { 
                if (content.includes(word)) results.push({ file: filePath, word }); 
            }); 
        } 
    }); 
    return results; 
} 
const violations = walk('./app').concat(walk('./components')); 
if (violations.length > 0) { 
    console.log('❌ VIOLATIONS FOUND:'); 
    violations.forEach(v => console.log('- ' + v.word + ' in ' + v.file)); 
} else { 
    console.log('✅ TERMINOLOGY AUDIT PASSED: Zero banned words found.'); 
}
