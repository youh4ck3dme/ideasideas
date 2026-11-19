import React, { useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';

// Toast „Nová verzia je pripravená“ — zobrazí sa po controllerchange
// (service worker autoUpdate aplikoval novú verziu appky).
export const SWUpdateToast: React.FC = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onControllerChange = () => setVisible(true);
    window.addEventListener('controllerchange', onControllerChange);
    return () => window.removeEventListener('controllerchange', onControllerChange);
  }, []);

  if (!visible) return null;

  return (
    <div
      role="status"
      className="no-print fixed bottom-[calc(16px+env(safe-area-inset-bottom))] left-1/2 z-[60] flex w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 items-center justify-between gap-3 rounded-2xl border border-[#E5E7EB] bg-white px-4 py-3 shadow-lg shadow-black/10 dark:border-[#27272A] dark:bg-[#111113] dark:shadow-black/40"
    >
      <p className="text-xs font-medium text-[#111827] dark:text-[#F4F4F5]">
        Je dostupná nová verzia aplikácie
      </p>
      <button
        type="button"
        onClick={() => window.location.reload()}
        className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full bg-[#2563EB] px-3.5 text-xs font-medium text-white transition-transform hover:bg-[#1D4ED8] active:scale-[0.98]"
      >
        <RefreshCw className="h-3.5 w-3.5" />
        <span>Obnoviť</span>
      </button>
    </div>
  );
};
