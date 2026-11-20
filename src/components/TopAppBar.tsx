import React from 'react';
import { Download, FolderOpen, Globe, Moon, Plus, Sun } from 'lucide-react';
import { PWAInstallChip } from './PWAInstallChip';
import { useI18n } from '../i18n';
import { trackEvent } from '../utils/metrics';

interface TopAppBarProps {
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  onOpenHistory: () => void;
  onGoHome: () => void;
  projectTitle?: string;
  historyCount: number;
  isWorkspace: boolean;
  onOpenExport: () => void;
}

export const TopAppBar: React.FC<TopAppBarProps> = ({
  theme,
  onToggleTheme,
  onOpenHistory,
  onGoHome,
  projectTitle,
  historyCount,
  isWorkspace,
  onOpenExport,
}) => {
  const { t, locale, setLocale } = useI18n();
  return (
    <header className="no-print shrink-0 border-b border-[#E5E7EB] bg-white/90 px-3 pt-[max(env(safe-area-inset-top),12px)] backdrop-blur-md dark:border-[#27272A] dark:bg-[#09090B]/90 sm:px-6">
      <div className="mx-auto flex h-14 max-w-[1120px] items-center justify-between gap-3">
        {/* Left Zone: History + Brand Wordmark */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onOpenHistory}
            aria-label={`${t('appbar.historyAria')} (${historyCount})`}
            className="inline-flex h-10 min-w-[40px] items-center justify-center gap-1.5 rounded-full border border-[#E5E7EB] bg-[#FAFAFA] px-3 text-xs font-medium text-[#111827] transition-transform hover:bg-[#F4F4F5] active:scale-[0.98] dark:border-[#27272A] dark:bg-[#111113] dark:text-[#F4F4F5] dark:hover:bg-[#18181B] whitespace-nowrap shrink-0"
          >
            <FolderOpen className="h-4 w-4 text-[#52525B] dark:text-[#A1A1AA]" />
            <span className="hidden sm:inline">{t('appbar.projects')}</span>
            <span className="font-mono text-[11px] tabular-nums text-[#52525B] dark:text-[#A1A1AA]">
              {historyCount}
            </span>
          </button>

          <button
            type="button"
            onClick={onGoHome}
            className="inline-flex h-10 items-center gap-2 rounded-lg px-2 text-base font-bold tracking-tight text-[#111827] transition-opacity hover:opacity-80 dark:text-[#F4F4F5] whitespace-nowrap shrink-0"
          >
            <svg
              className="h-5 w-5 shrink-0"
              viewBox="0 0 32 32"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M16 3L27.2583 9.5V22.5L16 29L4.74167 22.5V9.5L16 3Z"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinejoin="round"
              />
              <path
                d="M16 3V16M16 16L27.2583 9.5M16 16L4.74167 9.5M16 16V29"
                stroke="#2563EB"
                strokeWidth="2.2"
                strokeLinecap="round"
              />
            </svg>
            <span>IdeaForge</span>
          </button>
        </div>

        {/* Center Zone: Active Project Name on Desktop */}
        <div className="hidden min-w-0 flex-1 justify-center md:flex">
          {isWorkspace && projectTitle && (
            <span className="max-w-xs truncate text-sm font-medium text-[#52525B] dark:text-[#A1A1AA]">
              {projectTitle}
            </span>
          )}
        </div>

        {/* Right Zone: PWA Install, Theme Toggle, Workspace Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <PWAInstallChip />

          {isWorkspace && (
            <>
              <button
                type="button"
                onClick={onOpenExport}
                aria-label={t('appbar.exportAria')}
                className="inline-flex h-10 items-center gap-1.5 rounded-full border border-[#E5E7EB] bg-white px-3 text-xs font-medium text-[#111827] transition-transform hover:bg-[#F4F4F5] active:scale-[0.98] dark:border-[#27272A] dark:bg-[#18181B] dark:text-[#F4F4F5] dark:hover:bg-[#27272A] whitespace-nowrap shrink-0"
              >
                <Download className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{t('appbar.export')}</span>
              </button>

              <button
                type="button"
                onClick={onGoHome}
                aria-label={t('appbar.newIdeaAria')}
                className="inline-flex h-10 items-center gap-1.5 rounded-full bg-[#2563EB] px-3.5 text-xs font-medium text-white transition-transform hover:bg-[#1D4ED8] active:scale-[0.98] whitespace-nowrap shrink-0"
              >
                <Plus className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{t('appbar.newIdea')}</span>
              </button>
            </>
          )}

          <button
            type="button"
            onClick={() => {
              const next = locale === 'sk' ? 'en' : 'sk';
              trackEvent('locale_changed', { locale: next });
              setLocale(next);
            }}
            aria-label={t('appbar.langAria')}
            className="inline-flex h-10 items-center gap-1 rounded-full border border-[#E5E7EB] bg-white px-2.5 text-[#52525B] transition-colors hover:bg-[#F4F4F5] dark:border-[#27272A] dark:bg-[#18181B] dark:text-[#A1A1AA] dark:hover:bg-[#27272A] shrink-0"
          >
            <Globe className="h-4 w-4" />
            <span className="text-[10px] font-bold">{locale.toUpperCase()}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              trackEvent('theme_changed', { theme: theme === 'dark' ? 'light' : 'dark' });
              onToggleTheme();
            }}
            aria-label={theme === 'dark' ? t('appbar.themeToLight') : t('appbar.themeToDark')}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#E5E7EB] bg-white text-[#52525B] transition-transform hover:bg-[#F4F4F5] hover:text-[#111827] active:scale-[0.96] dark:border-[#27272A] dark:bg-[#18181B] dark:text-[#A1A1AA] dark:hover:bg-[#27272A] dark:hover:text-[#F4F4F5] shrink-0"
          >
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
        </div>
      </div>
    </header>
  );
};
