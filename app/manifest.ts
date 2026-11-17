import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: '/',
    name: 'IdeaForge — AI Architekt nápadov',
    short_name: 'IdeaForge',
    description: 'AI architekt nápadov na digitálne produkty, technický návrh a marketingový plán.',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    background_color: '#FAFAFA',
    theme_color: '#2563EB',
    lang: 'sk',
    icons: [
      {
        src: '/pwa-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/pwa-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/pwa-maskable-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  };
}
