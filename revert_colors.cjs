const fs = require('fs');
const path = require('path');

const dirs = [
  'c:\\Users\\amara\\OneDrive\\Documentos\\gabriel.workspace\\dashboard\\src',
  'c:\\Users\\amara\\OneDrive\\Documentos\\gabriel.workspace\\dashboard\\src\\components'
];

dirs.forEach(dir => {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    if (file.endsWith('.tsx') || file.endsWith('.ts') || file.endsWith('.js') || file.endsWith('.css')) {
      const filePath = path.join(dir, file);
      let content = fs.readFileSync(filePath, 'utf8');
      
      // We will skip DumpComparison since they want it orange, but DumpComparison doesn't have A3FF12 anyway (it uses FF8A00).
      
      let newContent = content.replace(/#A3FF12/gi, '#00A3FF');
      newContent = newContent.replace(/#8BE600/gi, '#0055FF');
      newContent = newContent.replace(/#C6F432/gi, '#008AE6');
      
      if (content !== newContent) {
        fs.writeFileSync(filePath, newContent, 'utf8');
        console.log('Reverted ' + file);
      }
    }
  });
});
