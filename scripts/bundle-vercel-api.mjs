import { build } from 'esbuild';
import { rm } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

if (!process.env.VERCEL) {
  console.log('bundle-vercel-api: skip outside Vercel');
  process.exit(0);
}

await build({
  absWorkingDir: root,
  entryPoints: ['api/index.ts'],
  bundle: true,
  platform: 'node',
  format: 'esm',
  outfile: 'api/index.mjs',
  packages: 'external',
  logLevel: 'info',
});

await rm(path.join(root, 'api/index.ts'));
console.log('bundle-vercel-api: api/index.mjs ready, api/index.ts removed so Node can load the bundle');
