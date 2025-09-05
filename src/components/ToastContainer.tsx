'use client';

import { Toast } from './Toast';

export interface ToastMessage {
  id: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  duration?: number;
}

interface ToastContainerProps {
  toasts: ToastMessage[];
  onRemoveToast: (id: string) => void;
}

export function ToastContainer({ toasts, onRemoveToast }: ToastContainerProps) {
  if (toasts.length === 0) return null;

  return (
    <div className='fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 pointer-events-none'>
      <div className='space-y-2'>
        {toasts.map((toast, index) => (
          <div
            key={toast.id}
            style={{
              transform: `translateY(-${index * 4}px)`,
              zIndex: 50 - index,
            }}
            className='pointer-events-auto'
          >
            <Toast
              message={toast.message}
              isVisible={true}
              onClose={() => onRemoveToast(toast.id)}
              duration={toast.duration}
              type={toast.type}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
