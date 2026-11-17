import React from 'react';
import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

export const OfflineBanner: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) {
    return null;
  }

  return (
    <div
      role="status"
      className="no-print flex items-center justify-center gap-2 border-b border-amber-200 bg-amber-50 px-4 py-1.5 text-xs font-medium text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/60 dark:text-amber-200"
    >
      <WifiOff className="h-3.5 w-3.5 shrink-0" />
      <span>Ste offline — pracujete s uloženými projektmi v zariadení.</span>
    </div>
  );
};
