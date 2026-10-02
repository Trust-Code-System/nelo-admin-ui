import { copyFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const source = fileURLToPath(new URL('../index.html', import.meta.url));
const output = fileURLToPath(new URL('../dist/', import.meta.url));
await mkdir(output, { recursive: true });
await copyFile(source, `${output}/index.html`);
console.log('Built NELO admin UI in dist/');
