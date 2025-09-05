'use client';

import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { useCountdown, formatCountdown } from '@/hooks/useCountdown';
import { Wifi, WifiOff, RefreshCw, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatTimestamp } from '@/lib/utils';

interface NetworkStatusProps {
  lastUpdated?: number;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  nextRefreshTime?: number | null;
  onTimerExpire?: () => void;
}

export function NetworkStatus({
  lastUpdated,
  onRefresh,
  isRefreshing,
  nextRefreshTime,
  onTimerExpire,
}: NetworkStatusProps) {
  const isOnline = useNetworkStatus();
  const timeLeft = useCountdown(nextRefreshTime || null, onTimerExpire);

  return (
    <div className='flex items-center justify-center space-x-4 mb-6 text-xs'>
      {/* Online/Offline Status */}
      <div
        className={cn(
          'flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium',
          isOnline
            ? 'bg-green-100 text-green-700 border border-green-200'
            : 'bg-red-100 text-red-700 border border-red-200'
        )}
      >
        {isOnline ? (
          <>
            <Wifi className='h-3 w-3' />
            <span>Online</span>
          </>
        ) : (
          <>
            <WifiOff className='h-3 w-3' />
            <span>Offline</span>
          </>
        )}
      </div>

      {/* Last Updated */}
      {lastUpdated && <span className='text-gray-500'>Last updated: {formatTimestamp(lastUpdated)}</span>}

      {/* Timer */}
      {timeLeft > 0 && (
        <div className='flex items-center space-x-1 text-gray-500'>
          <Clock className='h-3 w-3' />
          <span>Next update: {formatCountdown(timeLeft)}</span>
        </div>
      )}

      {/* Refresh Button */}
      {onRefresh && (
        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          className={cn(
            'flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium',
            'bg-blue-100 text-blue-700 border border-blue-200',
            'hover:bg-blue-200 transition-colors',
            'disabled:opacity-50 disabled:cursor-not-allowed'
          )}
        >
          <RefreshCw className={cn('h-3 w-3', isRefreshing && 'animate-spin')} />
          <span>Refresh rates</span>
        </button>
      )}
    </div>
  );
}
