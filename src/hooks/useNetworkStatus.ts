// ─── Network Status Hook ──────────────────────────────────────────────────
// Reactively tracks online/offline status using browser APIs.

import { useState, useEffect } from 'react';

export interface NetworkStatus {
  isOnline: boolean;
}

/**
 * Hook that returns the current network status.
 * Updates reactively when the browser goes online or offline.
 */
export function useNetworkStatus(): NetworkStatus {
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true,
  );

  useEffect(() => {
    const handleOnline = () => {
      console.log('[Network] Back online');
      setIsOnline(true);
    };

    const handleOffline = () => {
      console.log('[Network] Gone offline');
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return { isOnline };
}
