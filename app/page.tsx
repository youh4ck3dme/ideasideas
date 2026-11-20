'use client';

import App from '@/src/App';
import { I18nProvider } from '@/src/i18n';
import { initErrorReporting } from '@/src/utils/errorReporting';

if (typeof window !== 'undefined') initErrorReporting();

export default function Page() {
  return (
    <I18nProvider>
      <App />
    </I18nProvider>
  );
}
