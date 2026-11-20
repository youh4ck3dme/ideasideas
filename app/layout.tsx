import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import './globals.css';

export const metadata: Metadata = {
  title: 'IdeaForge — AI Architekt nápadov',
  description:
    'Progresívna webová aplikácia, ktorá premení váš nápad na produkt, technický návrh, realizačný plán a marketingovú stratégiu v slovenčine.',
};

// Rovnaké pravidlá ako viewport meta v index.html (Vite build): zákaz zoomu,
// viewport-fit=cover pre notch/Dynamic Island, klávesnica nesmie rozťahovať layout.
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  interactiveWidget: 'resizes-content',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#FAFAFA' },
    { media: '(prefers-color-scheme: dark)', color: '#09090B' },
  ],
};

const themeInitScript = `try{var s=localStorage.getItem('ideaforge_theme');var d=window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches;if(s==='dark'||(!s&&d)){document.documentElement.classList.add('dark')}else{document.documentElement.classList.remove('dark')}}catch(e){}`;

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="sk" suppressHydrationWarning>
      <body className="bg-[#FAFAFA] text-[#111827] antialiased dark:bg-[#09090B] dark:text-[#F4F4F5]">
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        {children}
      </body>
    </html>
  );
}
