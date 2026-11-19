import type { Express } from 'express';

export const CONTENT_SECURITY_POLICY = [
  "default-src 'self'",
  // 'sha256-…' = hash inline theme-init skriptu v index.html ( zabráni flashu dark módu)
  "script-src 'self' 'sha256-xdtEP03zA3u1ViIOVbBVrZP8ypFC0R/9JiNGKBPxO2U=",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com",
  'img-src \'self\' data: blob:',
  "connect-src 'self' https://generativelanguage.googleapis.com https://api.mistral.ai https://*.upstash.io",
  "worker-src 'self' blob:",
  "manifest-src 'self'",
  "base-uri 'self'",
  "frame-ancestors 'none'",
  "form-action 'self'",
].join('; ');

export function applySecurity(app: Express): void {
  // Vercel/proxy frontuje aplikáciu jednou vrstvou, aby req.ip ukazovalo klienta
  app.set('trust proxy', 1);

  app.use((_req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    // V dev móde (Vite middleware/HMR) CSP neaplikujeme — injektované inline skripty by ho rozbili
    if (process.env.NODE_ENV === 'production' || process.env.FORCE_CSP === '1') {
      res.setHeader('Content-Security-Policy', CONTENT_SECURITY_POLICY);
    }
    next();
  });

  // Same-origin kontrola pre API (ochrana pred cross-origin POST-ami)
  app.use('/api', (req, res, next) => {
    const origin = req.headers.origin;
    if (origin) {
      const host = req.headers.host ?? '';
      const allowed = [`http://${host}`, `https://${host}`];
      if (host && !allowed.includes(origin)) {
        res.status(403).json({ error: 'Cross-origin požiadavky nie sú povolené.' });
        return;
      }
    }
    next();
  });
}
