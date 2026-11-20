import test from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { once } from 'node:events';
import type { AddressInfo } from 'node:net';
import { fileURLToPath } from 'node:url';
import { CONTENT_SECURITY_POLICY } from '../../server/security.ts';
import { createApiApp } from '../../server/aiArchitect.ts';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

function parseCsp(policy: string): Map<string, string[]> {
  const directives = new Map<string, string[]>();
  for (const part of policy.split(';')) {
    const tokens = part.trim().split(/\s+/).filter(Boolean);
    if (tokens.length === 0) continue;
    const [name, ...sources] = tokens;
    assert.equal(directives.has(name), false, `direktíva ${name} je v CSP dvakrát`);
    directives.set(name, sources);
  }
  return directives;
}

function sha256(body: string): string {
  return `sha256-${crypto.createHash('sha256').update(body).digest('base64')}`;
}

test('CSP: povinné direktívy sú zamknuté a script-src nemá unsafe-inline ani unsafe-eval', () => {
  const policy = parseCsp(CONTENT_SECURITY_POLICY);

  assert.deepEqual(policy.get('default-src'), ["'self'"]);
  assert.deepEqual(policy.get('base-uri'), ["'self'"]);
  assert.deepEqual(policy.get('form-action'), ["'self'"]);
  assert.deepEqual(policy.get('frame-ancestors'), ["'none'"]);
  assert.deepEqual(policy.get('object-src'), ["'none'"]);
  assert.deepEqual(policy.get('manifest-src'), ["'self'"]);

  const scriptSrc = policy.get('script-src') ?? [];
  assert.ok(scriptSrc.includes("'self'"));
  assert.equal(scriptSrc.some((src) => src.startsWith("'sha256-")), true);
  assert.equal(scriptSrc.includes("'unsafe-inline'"), false);
  assert.equal(scriptSrc.includes("'unsafe-eval'"), false);
  assert.equal(scriptSrc.includes('*'), false);

  const connectSrc = policy.get('connect-src') ?? [];
  assert.deepEqual(connectSrc, [
    "'self'",
    'https://generativelanguage.googleapis.com',
    'https://api.mistral.ai',
    'https://*.upstash.io',
  ]);

  const imgSrc = policy.get('img-src') ?? [];
  assert.deepEqual(imgSrc, ["'self'", 'data:', 'blob:']);
  assert.deepEqual(policy.get('worker-src'), ["'self'", 'blob:']);
  assert.deepEqual(policy.get('font-src'), ["'self'", 'https://fonts.gstatic.com']);

  const styleSrc = policy.get('style-src') ?? [];
  assert.ok(styleSrc.includes("'self'"));
  assert.ok(styleSrc.includes('https://fonts.googleapis.com'));
  assert.equal(styleSrc.includes("'unsafe-eval'"), false);

  for (const [name, sources] of policy) {
    for (const src of sources) {
      assert.equal(src.startsWith('http:'), false, `${name} nesmie povoliť http: (${src})`);
      assert.notEqual(src, '*', `${name} nesmie byť *`);
    }
  }
});

test('CSP: vercel.json má rovnakú politiku ako server', () => {
  const vercel = JSON.parse(fs.readFileSync(path.join(repoRoot, 'vercel.json'), 'utf8')) as {
    headers: Array<{ headers: Array<{ key: string; value: string }> }>;
  };
  const header = vercel.headers
    .flatMap((rule) => rule.headers)
    .find((item) => item.key === 'Content-Security-Policy');
  assert.ok(header, 'vercel.json musí posielať Content-Security-Policy');
  assert.equal(header.value, CONTENT_SECURITY_POLICY);
});

test('CSP: sha256 v script-src sedí s jediným inline skriptom v index.html', () => {
  const html = fs.readFileSync(path.join(repoRoot, 'index.html'), 'utf8');
  const inline = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)];
  assert.equal(inline.length, 1, 'index.html má mať práve jeden inline script');
  const expected = sha256(inline[0][1]);
  const scriptSrc = parseCsp(CONTENT_SECURITY_POLICY).get('script-src') ?? [];
  assert.ok(scriptSrc.includes(`'${expected}'`), `script-src neobsahuje ${expected}`);
});

test('CSP hlavička sa posiela v produkcii a pri FORCE_CSP, inak nie', async () => {
  const previous = {
    NODE_ENV: process.env.NODE_ENV,
    FORCE_CSP: process.env.FORCE_CSP,
  };
  const app = createApiApp({ aiClientFactory: () => null, rateLimit: false });
  const server = app.listen(0, '127.0.0.1');
  await once(server, 'listening');
  const { port } = server.address() as AddressInfo;
  const url = `http://127.0.0.1:${port}/api/health`;

  async function header(): Promise<string | null> {
    const res = await fetch(url);
    assert.equal(res.status, 200);
    return res.headers.get('content-security-policy');
  }

  try {
    process.env.NODE_ENV = 'development';
    delete process.env.FORCE_CSP;
    assert.equal(await header(), null);

    process.env.FORCE_CSP = '1';
    assert.equal(await header(), CONTENT_SECURITY_POLICY);

    delete process.env.FORCE_CSP;
    process.env.NODE_ENV = 'production';
    assert.equal(await header(), CONTENT_SECURITY_POLICY);
  } finally {
    if (previous.NODE_ENV === undefined) delete process.env.NODE_ENV;
    else process.env.NODE_ENV = previous.NODE_ENV;
    if (previous.FORCE_CSP === undefined) delete process.env.FORCE_CSP;
    else process.env.FORCE_CSP = previous.FORCE_CSP;
    server.close();
    await once(server, 'close');
  }
});
