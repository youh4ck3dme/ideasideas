import React from 'react';
import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { useI18n } from '../i18n';

interface OfflineBannerProps {
  pendingCount?: number;
}

export const OfflineBanner: React.FC<OfflineBannerProps> = ({ pendingCount = 0 }) => {
  const isOnline = useOnlineStatus();
  const { t } = useI18n();

  if (isOnline) {
    return null;
  }

  return (
    <div
      role="status"
      className="no-print flex items-center justify-center gap-2 border-b border-amber-200 bg-amber-50 px-4 py-1.5 text-xs font-medium text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/60 dark:text-amber-200"
    >
      <WifiOff className="h-3.5 w-3.5 shrink-0" />
      <span>
        {t('offline.text')}
        {pendingCount > 0 ? ` ${t('offline.pending', { count: pendingCount })}` : ''}
      </span>
    </div>
  );
};
