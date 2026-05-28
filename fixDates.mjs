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
  let changed = false;
  
  const regex = /([a-zA-Z0-9_\.\(\)]+)\.toISOString\(\)\.split\('T'\)\[0\]/g;
  
  if (regex.test(content)) {
    content = content.replace(regex, (match, p1) => {
      return "format(" + p1 + ", 'yyyy-MM-dd')";
    });
    
    if (!content.includes("import { format }") && !content.includes("import {format}")) {
      content = "import { format } from 'date-fns';\n" + content;
    }
    changed = true;
  }
  
  if (changed) {
    fs.writeFileSync(filePath, content);
    console.log('Fixed', filePath);
  }
});
