const fs = require('fs');
const path = require('path');

const dir = 'c:\\Users\\amara\\OneDrive\\Documentos\\gabriel.workspace\\dashboard\\src\\components';
const files = fs.readdirSync(dir);

files.forEach(file => {
  if (file.endsWith('.tsx')) {
    const filePath = path.join(dir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    let newContent = content.replace(/#00A3FF/gi, '#A3FF12');
    newContent = newContent.replace(/#0055FF/gi, '#8BE600');
    newContent = newContent.replace(/#008AE6/gi, '#C6F432');
    if (content !== newContent) {
      fs.writeFileSync(filePath, newContent, 'utf8');
      console.log('Updated ' + file);
    }
  }
});
