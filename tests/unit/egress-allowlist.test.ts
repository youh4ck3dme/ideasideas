import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

// Egress allowlist: jediné externé hosty, na ktoré aplikácia/server kód odkazuje.
// AI provider endpointy (generativelanguage.googleapis.com, api.mistral.ai) sú
// defaultné endpointy SDK (@google/genai, @ai-sdk/mistral); Upstash je z env premennej.
const ALLOWED_EXACT_HOSTS = new Set([
  'fonts.googleapis.com',
  'fonts.gstatic.com',
  'generativelanguage.googleapis.com',
  'api.mistral.ai',
  'openapi.vercel.sh',
  'www.w3.org',
]);
const ALLOWED_SUFFIXES = ['.upstash.io'];

const SCAN_DIRS = ['server', 'src', 'app', 'lib', 'api'];
const SCAN_FILES = ['index.html', 'vite.config.ts', 'vercel.json', 'next.config.ts', 'package.json'];
const SCAN_EXTENSIONS = new Set(['.ts', '.tsx', '.js', '.mjs', '.html', '.json', '.css', '.svg', '.webmanifest']);

function collectFiles(): string[] {
  const files: string[] = [];
  for (const rel of SCAN_FILES) {
    const abs = path.join(repoRoot, rel);
    if (fs.existsSync(abs)) files.push(abs);
  }
  const walk = (dir: string) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const abs = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (entry.name === 'node_modules' || entry.name === 'dist' || entry.name === '.git') continue;
        walk(abs);
      } else if (SCAN_EXTENSIONS.has(path.extname(entry.name))) {
        files.push(abs);
      }
    }
  };
  for (const rel of SCAN_DIRS) {
    const abs = path.join(repoRoot, rel);
    if (fs.existsSync(abs)) walk(abs);
  }
  const publicDir = path.join(repoRoot, 'public');
  if (fs.existsSync(publicDir)) walk(publicDir);
  return files;
}

function extractHosts(content: string): Set<string> {
  const hosts = new Set<string>();
  const matches = content.matchAll(/https?:\/\/([a-zA-Z0-9.-]+)/g);
  for (const m of matches) hosts.add(m[1].toLowerCase());
  return hosts;
}

function isAllowed(host: string): boolean {
  if (ALLOWED_EXACT_HOSTS.has(host)) return true;
  return ALLOWED_SUFFIXES.some((suffix) => host.endsWith(suffix));
}

test('egress: všetky externé URL v kóde sú v allowliste (žiadny neočakávaný egress)', () => {
  const files = collectFiles();
  assert.ok(files.length > 20, 'sken by mal pokryť dostatok súborov');
  const offenders: string[] = [];
  for (const file of files) {
    const content = fs.readFileSync(file, 'utf8');
    for (const host of extractHosts(content)) {
      if (!isAllowed(host)) {
        offenders.push(`${path.relative(repoRoot, file)} -> ${host}`);
      }
    }
  }
  assert.deepEqual(offenders, [], `Ne povolené externé hosty:\n${offenders.join('\n')}`);
});

test('egress: connect-src CSP v security.ts zodpovedá allowliste', () => {
  const security = fs.readFileSync(path.join(repoRoot, 'server/security.ts'), 'utf8');
  const csp = security.match(/CONTENT_SECURITY_POLICY = \[([\s\S]*?)\]\.join/);
  assert.ok(csp, 'CSP konštanta existuje');
  const connectSrc = csp[1].match(/connect-src[^,]*'([^']+)'/g) ?? [];
  const hostsInCsp = connectSrc.flatMap((entry) =>
    [...entry.matchAll(/https:\/\/([a-zA-Z0-9.*-]+)/g)].map((m) => m[1])
  );
  for (const host of hostsInCsp) {
    const bare = host.replace(/^\*\./, '');
    const allowed =
      isAllowed(bare) || ALLOWED_SUFFIXES.some((s) => bare === s.slice(1) || bare.endsWith(s));
    assert.ok(allowed, `CSP connect-src host mimo allowlist: ${host}`);
  }
});
