interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

// In-memory sliding window fallback map
const ipHitMap = new Map<string, number[]>();

export async function checkRateLimit(
  ip: string,
  limit = 20,
  windowMs = 60_000
): Promise<RateLimitResult> {
  const now = Date.now();
  const upstashUrl = process.env.UPSTASH_REDIS_REST_URL?.trim();
  const upstashToken = process.env.UPSTASH_REDIS_REST_TOKEN?.trim();

  if (upstashUrl && upstashToken) {
    try {
      const key = `ideaforge_rate_limit:${ip}`;
      const res = await fetch(`${upstashUrl}/pipeline`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${upstashToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify([
          ['INCR', key],
          ['EXPIRE', key, Math.ceil(windowMs / 1000)],
        ]),
      });

      if (res.ok) {
        const data = await res.json();
        const count = Number(data[0]?.result) || 1;
        return {
          success: count <= limit,
          limit,
          remaining: Math.max(0, limit - count),
          reset: now + windowMs,
        };
      }
    } catch (e) {
      console.warn('Upstash rate limit fallback to memory:', e);
    }
  }

  // In-memory sliding window fallback
  const windowStart = now - windowMs;
  const hits = (ipHitMap.get(ip) || []).filter((time) => time > windowStart);
  hits.push(now);
  ipHitMap.set(ip, hits);

  // Periodic cleanup if map grows large
  if (ipHitMap.size > 1000) {
    for (const [k, v] of ipHitMap.entries()) {
      const valid = v.filter((time) => time > windowStart);
      if (valid.length === 0) ipHitMap.delete(k);
      else ipHitMap.set(k, valid);
    }
  }

  const success = hits.length <= limit;
  return {
    success,
    limit,
    remaining: Math.max(0, limit - hits.length),
    reset: now + windowMs,
  };
}
