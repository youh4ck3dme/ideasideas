import React from 'react';
import { AlertCircle, RotateCcw, X } from 'lucide-react';

interface ErrorToastProps {
  message: string | null;
  onRetry?: () => void;
  onDismiss: () => void;
  hasBottomNav?: boolean;
}

export const ErrorToast: React.FC<ErrorToastProps> = ({
  message,
  onRetry,
  onDismiss,
  hasBottomNav = false,
}) => {
  if (!message) return null;

  return (
    <div
      role="alert"
      aria-live="assertive"
      className={`no-print fixed left-4 right-4 z-50 mx-auto max-w-md rounded-2xl border border-red-200 bg-white p-4 shadow-lg shadow-black/5 dark:border-red-900/70 dark:bg-[#111113] dark:shadow-black/30 md:left-auto md:right-6 md:bottom-6 md:w-[400px] ${
        hasBottomNav
          ? 'bottom-[calc(76px+env(safe-area-inset-bottom))]'
          : 'bottom-[calc(16px+env(safe-area-inset-bottom))]'
      }`}
    >
      <div className="flex items-start gap-3">
        <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600 dark:text-red-400" />
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold text-[#111827] dark:text-[#F4F4F5]">
            Nepodarilo sa dokončiť požiadavku
          </p>
          <p className="mt-1 text-xs leading-relaxed text-[#52525B] dark:text-[#A1A1AA]">
            {message}
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {onRetry && (
              <button
                type="button"
                onClick={onRetry}
                className="inline-flex h-8 items-center gap-1.5 rounded-full bg-[#2563EB] px-3.5 text-xs font-medium text-white transition-transform hover:bg-[#1D4ED8] active:scale-[0.98]"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Skúsiť znova</span>
              </button>
            )}
            <button
              type="button"
              onClick={onDismiss}
              className="inline-flex h-8 items-center rounded-full border border-[#E5E7EB] px-3 text-xs font-medium text-[#52525B] hover:text-[#111827] dark:border-[#27272A] dark:text-[#A1A1AA] dark:hover:text-[#F4F4F5]"
            >
              Zavrieť
            </button>
          </div>
        </div>
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Zavrieť upozornenie"
          className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[#71717A] hover:bg-[#F4F4F5] hover:text-[#111827] dark:hover:bg-[#27272A] dark:hover:text-[#F4F4F5]"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};
