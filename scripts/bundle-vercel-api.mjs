import { build } from 'esbuild';
import { writeFile } from 'node:fs/promises';
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

await writeFile(
  path.join(root, 'api/index.ts'),
  "import app from './index.mjs';\nexport default app;\n"
);
console.log('bundle-vercel-api: api/index.mjs ready, api/index.ts now re-exports it');
