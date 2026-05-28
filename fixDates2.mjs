import fs from 'fs';
import path from 'path';

function walk(dir, cb) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) walk(fullPath, cb);
    else cb(fullPath);
  }
}

walk('./src', (filePath) => {
  if (!filePath.endsWith('.tsx') && !filePath.endsWith('.ts')) return;
  
  let content = fs.readFileSync(filePath, 'utf8');
  if (content.includes('new format(Date(),')) {
    content = content.replace(/new format\(Date\(\),/g, 'format(new Date(),');
    fs.writeFileSync(filePath, content);
    console.log('Fixed', filePath);
  }
});
