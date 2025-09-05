'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ToastProps {
  message: string;
  isVisible: boolean;
  onClose: () => void;
  duration?: number;
  type?: 'info' | 'warning' | 'error' | 'success';
}

export function Toast({ message, isVisible, onClose, duration = 5000, type = 'warning' }: ToastProps) {
  const [shouldRender, setShouldRender] = useState(isVisible);

  useEffect(() => {
    if (isVisible) {
      setShouldRender(true);

      const timer = setTimeout(() => onClose(), duration);

      return () => clearTimeout(timer);
    } else {
      const timer = setTimeout(() => setShouldRender(false), 300);

      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  if (!shouldRender) return null;

  const typeStyles = {
    info: 'bg-blue-50 border-blue-200 text-blue-700',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-700',
    error: 'bg-red-50 border-red-200 text-red-700',
    success: 'bg-green-50 border-green-200 text-green-700',
  };

  return (
    <div className='fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 pointer-events-none'>
      <div
        className={cn(
          'flex items-center justify-between p-3 border rounded-lg shadow-lg min-w-80 max-w-md pointer-events-auto',
          typeStyles[type],
          isVisible ? 'transform translate-y-0 opacity-100' : 'transform translate-y-2 opacity-0',
          'transition-all duration-300 ease-out'
        )}
      >
        <span className='text-sm font-medium'>{message}</span>
        <button
          onClick={onClose}
          className={cn(
            'ml-3 p-1 rounded-full hover:bg-black/10 transition-colors',
            'focus:outline-none focus:ring-2 focus:ring-current focus:ring-opacity-50'
          )}
        >
          <X className='h-4 w-4' />
        </button>
      </div>
    </div>
  );
}
