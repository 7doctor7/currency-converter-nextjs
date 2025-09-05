import { useState, useCallback } from 'react';
import { ToastMessage } from '@/components/ToastContainer';

export function useToast() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback((message: string, type: ToastMessage['type'] = 'info', duration = 5000) => {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    const newToast: ToastMessage = { id, message, type, duration };

    setToasts(prev => [...prev, newToast]);

    if (duration > 0) {
      setTimeout(() => setToasts(prev => prev.filter(toast => toast.id !== id)), duration);
    }
  }, []);

  const removeToast = useCallback((id: string) => setToasts(prev => prev.filter(toast => toast.id !== id)), []);

  const showSuccess = useCallback(
    (message: string, duration?: number) => addToast(message, 'success', duration),
    [addToast]
  );

  const showError = useCallback((message: string, duration = 7000) => addToast(message, 'error', duration), [addToast]);

  const showWarning = useCallback(
    (message: string, duration?: number) => addToast(message, 'warning', duration),
    [addToast]
  );

  const showInfo = useCallback((message: string, duration?: number) => addToast(message, 'info', duration), [addToast]);

  return {
    toasts,
    addToast,
    removeToast,
    showSuccess,
    showError,
    showWarning,
    showInfo,
  };
}
