import React, { useState } from 'react';
import { Download, Share, X } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const PWAInstallChip: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  if (isInstalled) {
    return null;
  }

  if (isInstallable) {
    return (
      <button
        type="button"
        onClick={install}
        aria-label="Nainštalovať apku"
        className="inline-flex h-9 items-center gap-1.5 rounded-full border border-[#E5E7EB] bg-white px-3 text-xs font-medium text-[#111827] transition-transform hover:bg-[#F4F4F5] active:scale-[0.98] dark:border-[#27272A] dark:bg-[#18181B] dark:text-[#F4F4F5] dark:hover:bg-[#27272A] whitespace-nowrap shrink-0"
      >
        <Download className="h-3.5 w-3.5 text-[#2563EB]" />
        <span className="hidden sm:inline">Nainštalovať apku</span>
        <span className="sm:hidden">Apka</span>
      </button>
    );
  }

  if (isIOS) {
    return (
      <>
        <button
          type="button"
          onClick={() => setShowIOSGuide(true)}
          aria-label="Nainštalovať apku na iOS"
          className="inline-flex h-9 items-center gap-1.5 rounded-full border border-[#E5E7EB] bg-white px-3 text-xs font-medium text-[#111827] transition-transform hover:bg-[#F4F4F5] active:scale-[0.98] dark:border-[#27272A] dark:bg-[#18181B] dark:text-[#F4F4F5] dark:hover:bg-[#27272A] whitespace-nowrap shrink-0"
        >
          <Download className="h-3.5 w-3.5 text-[#2563EB]" />
          <span className="hidden sm:inline">Nainštalovať apku</span>
          <span className="sm:hidden">Apka</span>
        </button>

        {showIOSGuide && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs"
            role="dialog"
            aria-modal="true"
            aria-labelledby="ios-install-title"
          >
            <div className="w-full max-w-sm rounded-2xl border border-[#E5E7EB] bg-white p-6 dark:border-[#27272A] dark:bg-[#111113]">
              <div className="flex items-start justify-between gap-4">
                <h2 id="ios-install-title" className="text-base font-semibold text-[#111827] dark:text-[#F4F4F5]">
                  Inštalácia IdeaForge na iOS
                </h2>
                <button
                  type="button"
                  onClick={() => setShowIOSGuide(false)}
                  aria-label="Zavrieť návod na inštaláciu"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full text-[#52525B] hover:bg-[#F4F4F5] dark:text-[#A1A1AA] dark:hover:bg-[#27272A]"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <ol className="mt-4 space-y-3 text-sm leading-relaxed text-[#52525B] dark:text-[#A1A1AA]">
                <li className="flex items-start gap-2.5">
                  <span className="font-mono text-xs font-semibold text-[#2563EB] mt-0.5">01.</span>
                  <span>
                    Ťuknite na tlačidlo <strong className="font-medium text-[#111827] dark:text-[#F4F4F5] inline-flex items-center gap-1">Zdieľať <Share className="h-3.5 w-3.5 inline" /></strong> v spodnej lište Safari.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="font-mono text-xs font-semibold text-[#2563EB] mt-0.5">02.</span>
                  <span>
                    Posuňte ponuku nadol a vyberte <strong className="font-medium text-[#111827] dark:text-[#F4F4F5]">Pridať na plochu</strong>.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="font-mono text-xs font-semibold text-[#2563EB] mt-0.5">03.</span>
                  <span>Potvrďte klepnutím na <strong className="font-medium text-[#111827] dark:text-[#F4F4F5]">Pridať</strong> v pravom hornom rohu.</span>
                </li>
              </ol>
              <button
                type="button"
                onClick={() => setShowIOSGuide(false)}
                className="mt-6 h-11 w-full rounded-full bg-[#111827] text-sm font-medium text-white transition-colors hover:bg-[#1F2937] dark:bg-[#F4F4F5] dark:text-[#111827] dark:hover:bg-white"
              >
                Rozumiem
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
