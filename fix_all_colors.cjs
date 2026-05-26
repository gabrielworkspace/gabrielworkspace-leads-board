const fs = require('fs');
const path = require('path');

const dir = 'c:\\Users\\amara\\OneDrive\\Documentos\\gabriel.workspace\\dashboard\\src\\components';
const files = fs.readdirSync(dir);

files.forEach(file => {
  if (file.endsWith('.tsx') && file !== 'DumpComparison.tsx') {
    const filePath = path.join(dir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Replace green (#10B981)
    content = content.replace(/#10B981/gi, '#00A3FF');
    // Replace purple (#8B5CF6)
    content = content.replace(/#8B5CF6/gi, '#0055FF');
    // Replace orange (#F97316)
    content = content.replace(/#F97316/gi, '#008AE6');
    
    // Replace hover colors or others if any
    
    fs.writeFileSync(filePath, content, 'utf8');
  }
});

// also check App.tsx
const appPath = 'c:\\Users\\amara\\OneDrive\\Documentos\\gabriel.workspace\\dashboard\\src\\App.tsx';
let appContent = fs.readFileSync(appPath, 'utf8');
appContent = appContent.replace(/#10B981/gi, '#00A3FF').replace(/#8B5CF6/gi, '#0055FF').replace(/#F97316/gi, '#008AE6');
fs.writeFileSync(appPath, appContent, 'utf8');

console.log('Colors replaced successfully');
