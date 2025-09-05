'use client';

import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Currency } from '@/types/currency';
// import { CURRENCIES } from '@/lib/currencies'; // Удаляем импорт
import { Search, X, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CurrencyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (currency: Currency) => void;
  selectedCurrency: Currency;
  currencies: Currency[];
}

export function CurrencyModal({ isOpen, onClose, onSelect, selectedCurrency, currencies }: CurrencyModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(-1); // Start with no selection
  const searchInputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const filteredCurrencies = useMemo(() => {
    if (!currencies || currencies.length === 0) return [];
    if (!searchQuery.trim()) return currencies;

    const query = searchQuery.toLowerCase();

    return currencies.filter(
      currency => currency.code.toLowerCase().includes(query) || currency.name.toLowerCase().includes(query)
    );
  }, [searchQuery, currencies]);

  useEffect(() => {
    if (isOpen) {
      setSearchQuery('');
      setSelectedIndex(-1);
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  useEffect(() => {
    setSelectedIndex(-1);
  }, [searchQuery]);

  const handleSelect = useCallback(
    (currency: Currency) => {
      onSelect(currency);
      onClose();
    },
    [onSelect, onClose]
  );

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => (prev < filteredCurrencies.length - 1 ? prev + 1 : 0));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => (prev > 0 ? prev - 1 : filteredCurrencies.length - 1));
          break;
        case 'Enter':
          e.preventDefault();
          if (selectedIndex >= 0 && filteredCurrencies[selectedIndex]) {
            handleSelect(filteredCurrencies[selectedIndex]);
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedIndex, filteredCurrencies, onClose, handleSelect]);

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 z-50 overflow-y-auto'>
      <div className='flex min-h-full items-center justify-center p-4'>
        {/* Invisible backdrop for closing */}
        <div className='fixed inset-0' onClick={onClose} />

        {/* Modal */}
        <div className='relative w-full max-w-md transform rounded-lg bg-white p-6 shadow-2xl border border-gray-200 transition-all'>
          <div className='flex items-center justify-between mb-4'>
            <h2 className='text-lg font-semibold text-gray-900'>Select currency</h2>
            <button onClick={onClose} className='text-gray-400 hover:text-gray-600 transition-colors'>
              <X className='h-5 w-5' />
            </button>
          </div>

          <p className='text-sm text-gray-600 mb-4'>
            Choose a currency from the list below or use the search bar to find a specific currency.
          </p>

          {/* Search Input */}
          <div className='relative mb-4'>
            <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400' />
            <input
              ref={searchInputRef}
              type='text'
              placeholder='Input'
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className={cn(
                'w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg',
                'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
              )}
            />
          </div>

          {/* Currency List */}
          <ul ref={listRef} className='max-h-60 overflow-y-auto space-y-1'>
            {filteredCurrencies.length === 0 ? (
              <li className='text-center py-8 text-gray-500'>
                {currencies.length === 0 ? 'Loading currencies...' : 'No currencies found'}
              </li>
            ) : (
              filteredCurrencies.map((currency, index) => (
                <li key={currency.code}>
                  <button
                    onClick={() => handleSelect(currency)}
                    className={cn(
                      'w-full flex items-center justify-between px-3 py-2 rounded-lg',
                      'hover:bg-gray-50 transition-colors text-left',
                      selectedIndex === index && 'bg-blue-50 ring-2 ring-blue-500',
                      currency.code === selectedCurrency.code && 'bg-blue-100'
                    )}
                  >
                    <div className='flex items-center space-x-3 flex-1'>
                      <div className='w-8 h-8 rounded-full bg-blue-100 border border-blue-300 flex items-center justify-center'>
                        <span className='text-sm font-bold text-blue-700'>{currency.symbol || currency.code}</span>
                      </div>
                      <div className='flex-1'>
                        <div className='font-medium text-gray-900'>{currency.code}</div>
                        <div className='text-sm text-gray-500'>{currency.name}</div>
                      </div>
                    </div>
                    {currency.code === selectedCurrency.code && <Check className='h-4 w-4 text-blue-600' />}
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
