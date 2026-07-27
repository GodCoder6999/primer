import fs from 'fs';
import path from 'path';

function transpileAsyncToPromises(code) {
  return code
    .replace(/async function\s+([a-zA-Z0-9_]+)\s*\(([^)]*)\)\s*\{/g, 'function $1($2) { return new Promise((resolve, reject) => { try {')
    .replace(/await\s+([a-zA-Z0-9_().]+)/g, 'yield $1');
}

function transpileDirectory(dirPath) {
  if (!fs.existsSync(dirPath)) return;
  const files = fs.readdirSync(dirPath);

  for (const file of files) {
    const fullPath = path.join(dirPath, file);
    if (file.endsWith('.js')) {
      const content = fs.readFileSync(fullPath, 'utf8');
      const transpiled = transpileAsyncToPromises(content);
      fs.writeFileSync(fullPath, transpiled);
      console.log(`[Hermes Transpiled] ${file}`);
    }
  }
}

console.log('Running Hermes JS Compatibility Transpilation...');
transpileDirectory(path.resolve('lib/streaming/providers'));
