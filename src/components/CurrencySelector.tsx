'use client';

import { useState } from 'react';
import { Currency } from '@/types/currency';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CurrencyModal } from './CurrencyModal';

interface CurrencySelectorProps {
  currency: Currency;
  onCurrencyChange: (currency: Currency) => void;
  label: string;
  currencies: Currency[];
}

export function CurrencySelector({ currency, onCurrencyChange, label, currencies }: CurrencySelectorProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <div className='space-y-2'>
        <label className='text-sm font-medium text-gray-700'>{label}</label>
        <button
          onClick={() => setIsModalOpen(true)}
          className={cn(
            'w-full flex items-center justify-between px-3 py-2',
            'border border-gray-300 rounded-lg bg-white',
            'hover:border-gray-400 focus:outline-none focus:ring-2',
            'focus:ring-blue-500 focus:border-transparent',
            'transition-colors'
          )}
        >
          <div className='flex items-center space-x-2'>
            <div className='w-8 h-8 rounded-full bg-blue-100 border border-blue-300 flex items-center justify-center'>
              <span className='text-sm font-bold text-blue-700'>{currency.symbol || currency.code}</span>
            </div>
            <div className='text-left'>
              <div className='font-medium text-gray-900'>{currency.code}</div>
              <div className='text-xs text-gray-500 truncate max-w-32'>{currency.name}</div>
            </div>
          </div>
          <ChevronDown className='h-4 w-4 text-gray-400' />
        </button>
      </div>

      <CurrencyModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSelect={onCurrencyChange}
        selectedCurrency={currency}
        currencies={currencies}
      />
    </>
  );
}
