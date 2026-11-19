import React, { useState } from 'react';
import { ArrowUp, Loader2 } from 'lucide-react';
import type { WorkspaceTabKey } from '../types/project';
import { scrollBehavior } from '../utils/motion';

interface RefineBarProps {
  tabKey: WorkspaceTabKey;
  tabLabel: string;
  isRefining: boolean;
  error?: string | null;
  onRefine: (instruction: string) => Promise<void>;
  onRetry?: () => void;
}

const TAB_SUGGESTIONS: Record<WorkspaceTabKey, string[]> = {
  promo: ['Zostri tón komunikácie pre B2B', 'Pridaj silnejšiu urgenciu do CTA'],
  roadmap: ['Rozdeľ MVP na menšie týždňové kroky', 'Zrýchli validáciu na 7 dní'],
  tech: ['Prepracuj stack na no-code riešenie', 'Zníž mesačné náklady pod 20 €'],
  marketing: ['Prispôsob marketing pre rozpočet 0 €', 'Zameraj sa viac na LinkedIn akvizíciu'],
  antifail: ['Doplň riziká slovenskej legislatívy', 'Rozpracuj virálnu slučku podrobnejšie'],
};

export const RefineBar: React.FC<RefineBarProps> = ({
  tabKey,
  tabLabel,
  isRefining,
  error,
  onRefine,
  onRetry,
}) => {
  const [instruction, setInstruction] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = instruction.trim();
    if (!trimmed || isRefining) return;
    await onRefine(trimmed);
    setInstruction('');
  };

  return (
    <section
      aria-label={`Upraviť sekciu ${tabLabel}`}
      className="no-print mt-10 rounded-2xl border border-[#E5E7EB] bg-white p-4 dark:border-[#27272A] dark:bg-[#111113]"
    >
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3">
        <p className="text-xs font-medium text-[#52525B] dark:text-[#A1A1AA]">
          AI úprava sekcie: <span className="text-[#111827] dark:text-[#F4F4F5]">{tabLabel}</span>
        </p>
        <div className="flex flex-wrap items-center gap-1.5">
          {TAB_SUGGESTIONS[tabKey].map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              disabled={isRefining}
              onClick={() => setInstruction(suggestion)}
              className="rounded-full border border-[#E5E7EB] bg-[#FAFAFA] px-2.5 py-1 text-[11px] font-medium text-[#52525B] transition-transform hover:border-[#2563EB]/40 hover:text-[#111827] disabled:opacity-50 dark:border-[#27272A] dark:bg-[#18181B] dark:text-[#A1A1AA] dark:hover:text-[#F4F4F5]"
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <input
          type="text"
          value={instruction}
          onChange={(e) => setInstruction(e.target.value)}
          onFocus={(e) => {
            const el = e.currentTarget;
            window.setTimeout(() => {
              el.scrollIntoView({ block: 'center', behavior: scrollBehavior() });
            }, 150);
          }}
          disabled={isRefining}
          placeholder="Upraviť alebo rozpracovať túto sekciu..."
          aria-label="Upraviť alebo rozpracovať túto sekciu"
          className="h-11 min-w-0 flex-1 rounded-full border border-[#E5E7EB] bg-[#FAFAFA] px-4 text-base text-[#111827] placeholder-[#71717A] focus:border-[#2563EB] focus:bg-white focus:outline-hidden disabled:opacity-60 dark:border-[#27272A] dark:bg-[#09090B] dark:text-[#F4F4F5] dark:placeholder-[#71717A] dark:focus:border-[#3B82F6] sm:text-sm"
        />
        <button
          type="submit"
          disabled={isRefining || !instruction.trim()}
          aria-label="Odoslať požiadavku na úpravu sekcie"
          className="inline-flex h-11 shrink-0 items-center gap-1.5 rounded-full bg-[#2563EB] px-4 text-xs font-medium text-white transition-transform hover:bg-[#1D4ED8] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-45"
        >
          {isRefining ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="hidden sm:inline">Upravujem...</span>
            </>
          ) : (
            <>
              <span className="hidden sm:inline">Upraviť</span>
              <ArrowUp className="h-4 w-4" />
            </>
          )}
        </button>
      </form>
    </section>
  );
};
