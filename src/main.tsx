import { createRoot } from 'react-dom/client';
import { registerSW } from 'virtual:pwa-register';
import App from './App.tsx';
import { I18nProvider } from './i18n';
import { initErrorReporting } from './utils/errorReporting';
import './index.css';

initErrorReporting();

if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  registerSW({
    immediate: true,
    onRegisteredSW(_swUrl, registration) {
      // V produkcii kontroluj novú verziu SW každú minútu (autoUpdate ju aplikuje
      // a SWUpdateToast cez controllerchange ponúkne obnovenie)
      if (registration && import.meta.env.PROD) {
        window.setInterval(() => {
          registration.update().catch(() => {});
        }, 60_000);
      }
    },
    onOfflineReady() {
      // Service worker cached shell for offline launch
    },
  });
}

createRoot(document.getElementById('root')!).render(
  <I18nProvider>
    <App />
  </I18nProvider>
);
