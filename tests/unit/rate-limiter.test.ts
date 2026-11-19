import test from 'node:test';
import assert from 'node:assert/strict';
import { checkRateLimit } from '../../lib/rate-limiter.ts';

let ipCounter = 0;
function uniqueIp(): string {
  ipCounter += 1;
  return `10.99.${Math.floor(ipCounter / 250)}.${ipCounter % 250}`;
}

test('in-memory rate limiter allows up to the limit, then blocks', async () => {
  const ip = uniqueIp();
  const first = await checkRateLimit(ip, 3, 60_000);
  assert.equal(first.success, true);
  assert.equal(first.remaining, 2);
  const second = await checkRateLimit(ip, 3, 60_000);
  assert.equal(second.success, true);
  const third = await checkRateLimit(ip, 3, 60_000);
  assert.equal(third.success, true);
  const fourth = await checkRateLimit(ip, 3, 60_000);
  assert.equal(fourth.success, false);
  assert.equal(fourth.remaining, 0);
});

test('rate limiter window expires and allows again', async () => {
  const ip = uniqueIp();
  const blocked = await checkRateLimit(ip, 1, 50);
  assert.equal(blocked.success, true);
  const over = await checkRateLimit(ip, 1, 50);
  assert.equal(over.success, false);
  await new Promise((resolve) => setTimeout(resolve, 70));
  const after = await checkRateLimit(ip, 1, 50);
  assert.equal(after.success, true);
});

test('rate limiter tracks IPs independently', async () => {
  const a = uniqueIp();
  const b = uniqueIp();
  assert.equal((await checkRateLimit(a, 1, 60_000)).success, true);
  assert.equal((await checkRateLimit(a, 1, 60_000)).success, false);
  assert.equal((await checkRateLimit(b, 1, 60_000)).success, true);
});
