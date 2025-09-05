'use client';

import { useState, useEffect, useCallback } from 'react';
import { Currency, ExchangeRate, ConversionResult } from '@/types/currency';
import { loadCurrencies, getDefaultCurrencies } from '@/lib/currencies';
import { CurrencyAPI } from '@/lib/api';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useDebounce } from '@/hooks/useDebounce';
import { parseAmount, formatCurrency, formatExchangeRate, formatTimestamp } from '@/lib/utils';
import { CurrencySelector } from './CurrencySelector';
import { NetworkStatus } from './NetworkStatus';
import { ToastContainer } from './ToastContainer';
import { useToast } from '@/hooks/useToast';
import { ArrowLeftRight, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CurrencyConverterState {
  fromCurrency: Currency;
  toCurrency: Currency;
  amount: string;
}

export function CurrencyConverter() {
  const [isMounted, setIsMounted] = useState(false);
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [currenciesLoading, setCurrenciesLoading] = useState(true);
  const [currenciesInitialized, setCurrenciesInitialized] = useState(false);
  const [state, setState] = useLocalStorage<CurrencyConverterState>('converter_state', {
    fromCurrency: { code: 'USD', name: 'US Dollar', symbol: '$' },
    toCurrency: { code: 'EUR', name: 'Euro', symbol: '€' },
    amount: '1',
  });
  const [localStorageLoaded, setLocalStorageLoaded] = useState(false);

  useEffect(() => {
    if (!localStorageLoaded) {
      setLocalStorageLoaded(true);
    }
  }, [state, localStorageLoaded]);

  const [rates, setRates] = useState<ExchangeRate | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [nextRefreshTime, setNextRefreshTime] = useState<number | null>(null);
  const { toasts, removeToast, showWarning, showError, showSuccess } = useToast();

  const handleShowError = useCallback((message: string) => showError(message), [showError]);

  useEffect(() => {
    setIsMounted(true);

    // Загружаем валюты только один раз при монтировании компонента
    if (!currenciesInitialized && localStorageLoaded) {
      const initializeCurrencies = async () => {
        try {
          setCurrenciesLoading(true);
          setCurrenciesInitialized(true);

          const loadedCurrencies = await loadCurrencies();

          setCurrencies(loadedCurrencies);

          const defaultCurrencies = getDefaultCurrencies(loadedCurrencies);

          setState(prevState => {
            const fromCurrencyExists = loadedCurrencies.find(c => c.code === prevState.fromCurrency.code);
            const toCurrencyExists = loadedCurrencies.find(c => c.code === prevState.toCurrency.code);

            if (fromCurrencyExists && toCurrencyExists) {
              return {
                ...prevState,
                fromCurrency: fromCurrencyExists,
                toCurrency: toCurrencyExists,
              };
            }

            return {
              ...prevState,
              fromCurrency: defaultCurrencies.from,
              toCurrency: defaultCurrencies.to,
            };
          });
        } catch (error) {
          console.error('CurrencyConverter: Failed to load currencies:', error);
          handleShowError('Failed to load currencies');
        } finally {
          setCurrenciesLoading(false);
        }
      };

      initializeCurrencies();
    }
  }, [setState, currenciesInitialized, handleShowError, localStorageLoaded]);

  const debouncedAmount = useDebounce(state.amount, 250);
  const api = CurrencyAPI.getInstance();

  const loadRates = useCallback(
    async (isManualRefresh = false) => {
      try {
        if (isManualRefresh) {
          setIsRefreshing(true);
        } else {
          setIsLoading(true);
        }

        const { rates: newRates, fromCache: cached, hasError } = await api.getRatesWithCache(isManualRefresh);

        setRates(newRates);

        switch (true) {
          case hasError && cached:
            showError(`API failed. Using cached rates from ${formatTimestamp(newRates.timestamp)}`);
            break;
          case cached && !isManualRefresh:
            showWarning(`Using cached rates from ${formatTimestamp(newRates.timestamp)}`);
            break;
          case !cached:
            if (isManualRefresh) {
              showSuccess('Exchange rates updated successfully');
            } else {
              showSuccess('Fresh exchange rates loaded');
            }
            break;
        }

        if (!cached && !isManualRefresh) {
          setNextRefreshTime(Date.now() + 5 * 60 * 1000);
        } else if (isManualRefresh) {
          setNextRefreshTime(Date.now() + 5 * 60 * 1000);
        }
      } catch (err) {
        showError('Failed to load exchange rates. Please try again.');
        console.error('Failed to load rates:', err);
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [api, showWarning, showError, showSuccess]
  );

  useEffect(() => {
    loadRates();

    const cached = api.getCachedRates();

    if (cached && cached.expiresAt > Date.now()) {
      setNextRefreshTime(cached.expiresAt);
    }
  }, [loadRates, api]);

  const handleTimerExpire = useCallback(() => {
    if (!isRefreshing && !isLoading) {
      loadRates();
    }
  }, [isRefreshing, isLoading, loadRates]);

  const [conversionResult, setConversionResult] = useState<ConversionResult | null>(null);

  useEffect(() => {
    if (!rates || !debouncedAmount) {
      setConversionResult(null);
      return;
    }

    const amount = parseAmount(debouncedAmount);

    if (amount <= 0) {
      setConversionResult(null);
      return;
    }

    const convertedAmount = api.convertCurrency(amount, state.fromCurrency.code, state.toCurrency.code, rates);
    const rate = api.getExchangeRate(state.fromCurrency.code, state.toCurrency.code, rates);
    const inverseRate = api.getExchangeRate(state.toCurrency.code, state.fromCurrency.code, rates);
    const result = {
      amount,
      fromCurrency: state.fromCurrency,
      toCurrency: state.toCurrency,
      convertedAmount,
      rate,
      inverseRate,
      timestamp: rates.timestamp,
    };

    setConversionResult(result);
  }, [rates, debouncedAmount, state.fromCurrency, state.toCurrency, api]);

  const handleAmountChange = (value: string) => {
    const sanitized = value.replace(/[^0-9.,]/g, '');

    setState(prev => ({ ...prev, amount: sanitized }));
  };

  const handleSwap = () => {
    setState(prev => ({
      ...prev,
      fromCurrency: prev.toCurrency,
      toCurrency: prev.fromCurrency,
    }));
  };

  const handleFromCurrencyChange = (currency: Currency) => {
    setState(prev => ({ ...prev, fromCurrency: currency }));
  };

  const handleToCurrencyChange = (currency: Currency) => {
    setState(prev => ({ ...prev, toCurrency: currency }));
  };

  // Prevent hydration mismatch by waiting for client-side mount
  if (!isMounted || currenciesLoading) {
    return (
      <div className='w-full max-w-6xl mx-auto p-4 mobile:p-6'>
        <div className='text-center mb-8'>
          <h1 className='text-3xl font-bold text-gray-900 mb-2'>Currency converter</h1>
          <p className='text-gray-600'>Get real-time exchange rates</p>
        </div>
        <div className='bg-white rounded-xl border-2 border-yellow-400 p-6'>
          <div className='flex items-center justify-center py-8'>
            <Loader2 className='h-6 w-6 animate-spin text-blue-600' />
          </div>
          {currenciesLoading && <p className='text-center text-gray-500 mt-4'>Loading currencies...</p>}
        </div>
      </div>
    );
  }

  return (
    // <div className="w-full max-w-4xl mx-auto p-4 mobile:p-6">
    <div className='w-full max-w-6xl mx-auto p-4 mobile:p-6'>
      <div className='text-center mb-8'>
        <h1 className='text-3xl font-bold text-gray-900 mb-2'>Currency converter</h1>
        <p className='text-gray-600'>Get real-time exchange rates</p>
      </div>

      <NetworkStatus
        lastUpdated={rates?.timestamp}
        onRefresh={() => loadRates(true)}
        isRefreshing={isRefreshing}
        nextRefreshTime={nextRefreshTime}
        onTimerExpire={handleTimerExpire}
      />

      {/* Desktop Layout */}
      <div className='hidden lg:block'>
        <div className='grid grid-cols-7 gap-6'>
          {/* Left Column - Input Controls Card (spans 5 columns) */}
          <div className='col-span-5 bg-white rounded-xl border border-gray-200 shadow-sm p-4 max-h-60'>
            {/* Amount Input */}
            <div className='space-y-2 mb-4'>
              <label className='text-sm font-medium text-gray-700'>Amount</label>
              <input
                type='text'
                value={state.amount}
                onChange={e => handleAmountChange(e.target.value)}
                placeholder='1'
                className={cn(
                  'w-full px-3 py-2 border border-gray-300 rounded-lg',
                  'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
                  'text-lg'
                )}
              />
            </div>

            {/* Currency Selectors with Swap - Horizontal on desktop */}
            <div className='grid grid-cols-5 gap-4 items-end'>
              <div className='col-span-2'>
                <CurrencySelector
                  currency={state.fromCurrency}
                  onCurrencyChange={handleFromCurrencyChange}
                  label='From'
                  currencies={currencies}
                />
              </div>

              <div className='col-span-1 flex justify-center items-end pb-2'>
                <button
                  onClick={handleSwap}
                  className={cn(
                    'p-1.5 rounded-full border border-gray-300 bg-white',
                    'hover:bg-gray-50 transition-colors',
                    'focus:outline-none focus:ring-2 focus:ring-blue-500'
                  )}
                >
                  <ArrowLeftRight className='h-4 w-4 text-gray-600' />
                </button>
              </div>

              <div className='col-span-2'>
                <CurrencySelector
                  currency={state.toCurrency}
                  onCurrencyChange={handleToCurrencyChange}
                  label='To'
                  currencies={currencies}
                />
              </div>
            </div>
          </div>

          {/* Right Column - Conversion Result Card (spans 2 columns) */}
          <div className='col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm p-6'>
            <h3 className='text-sm font-medium text-gray-700 mb-4'>Conversion result</h3>

            {isLoading ? (
              <div className='flex items-center justify-center py-8'>
                <Loader2 className='h-6 w-6 animate-spin text-blue-600' />
              </div>
            ) : conversionResult ? (
              <div className='space-y-4'>
                <div className='text-center'>
                  <div className='text-3xl font-bold text-gray-900'>
                    {state.toCurrency.symbol}
                    {formatCurrency(conversionResult.convertedAmount)}
                  </div>
                  <div className='text-sm text-gray-500 mt-1'>
                    {conversionResult.amount} {state.fromCurrency.code} =
                  </div>
                </div>

                <div className='space-y-3 text-sm'>
                  <div className='flex items-center justify-between'>
                    <span className='text-gray-600'>Exchange Rate</span>
                    <div className='font-medium text-gray-900'>
                      1 {state.fromCurrency.code} = {formatExchangeRate(conversionResult.rate)} {state.toCurrency.code}
                    </div>
                  </div>

                  <div className='flex items-center justify-between'>
                    <span className='text-gray-600'>Inverse Rate</span>
                    <div className='font-medium text-gray-900'>
                      1 {state.toCurrency.code} = {formatExchangeRate(conversionResult.inverseRate)}{' '}
                      {state.fromCurrency.code}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className='text-center py-8 text-gray-500'>Enter an amount to see conversion</div>
            )}

            <div className='border-t border-gray-200 mt-4 pt-4'>
              <div className='bg-gray-100 rounded-lg p-3'>
                <p className='text-xs text-gray-600 text-center'>
                  Rates are for informational purposes only and may not reflect real-time market rates
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile and Tablet Layout */}
      <div className='lg:hidden space-y-4'>
        {/* Input Controls Card */}
        <div className='bg-white rounded-xl border border-gray-200 shadow-sm p-6'>
          {/* Amount Input */}
          <div className='space-y-2 mb-6'>
            <label className='text-sm font-medium text-gray-700'>Amount</label>
            <input
              type='text'
              value={state.amount}
              onChange={e => handleAmountChange(e.target.value)}
              placeholder='1'
              className={cn(
                'w-full px-3 py-2 border border-gray-300 rounded-lg',
                'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
                'text-lg'
              )}
            />
          </div>

          {/* Currency Selectors - Vertical on mobile */}
          <div className='space-y-4'>
            <CurrencySelector
              currency={state.fromCurrency}
              onCurrencyChange={handleFromCurrencyChange}
              label='From'
              currencies={currencies}
            />

            <div className='flex justify-center'>
              <button
                onClick={handleSwap}
                className={cn(
                  'p-2 rounded-full border border-gray-300 bg-white',
                  'hover:bg-gray-50 transition-colors',
                  'focus:outline-none focus:ring-2 focus:ring-blue-500'
                )}
              >
                <ArrowLeftRight className='h-4 w-4 text-gray-600' />
              </button>
            </div>

            <CurrencySelector
              currency={state.toCurrency}
              onCurrencyChange={handleToCurrencyChange}
              label='To'
              currencies={currencies}
            />
          </div>
        </div>

        {/* Conversion Result Card */}
        <div className='bg-white rounded-xl border border-gray-200 shadow-sm p-6'>
          <h3 className='text-sm font-medium text-gray-700 mb-4'>Conversion result</h3>

          {isLoading ? (
            <div className='flex items-center justify-center py-8'>
              <Loader2 className='h-6 w-6 animate-spin text-blue-600' />
            </div>
          ) : conversionResult ? (
            <div className='space-y-4'>
              <div className='text-center'>
                <div className='text-3xl font-bold text-gray-900'>
                  {state.toCurrency.symbol}
                  {formatCurrency(conversionResult.convertedAmount)}
                </div>
                <div className='text-sm text-gray-500 mt-1'>
                  {conversionResult.amount} {state.fromCurrency.code} =
                </div>
              </div>

              <div className='space-y-3 text-sm'>
                <div>
                  <span className='text-gray-600'>Exchange Rate</span>
                  <div className='font-medium text-gray-900'>
                    1 {state.fromCurrency.code} = {formatExchangeRate(conversionResult.rate)} {state.toCurrency.code}
                  </div>
                </div>
                <div>
                  <span className='text-gray-600'>Inverse Rate</span>
                  <div className='font-medium text-gray-900'>
                    1 {state.toCurrency.code} = {formatExchangeRate(conversionResult.inverseRate)}{' '}
                    {state.fromCurrency.code}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className='text-center py-8 text-gray-500'>Enter an amount to see conversion</div>
          )}

          <div className='bg-gray-100 rounded-lg p-3 mt-4'>
            <p className='text-xs text-gray-600 text-center'>
              Rates are for informational purposes only and may not reflect real-time market rates
            </p>
          </div>
        </div>
      </div>

      {/* Toast notifications */}
      <ToastContainer toasts={toasts} onRemoveToast={removeToast} />
    </div>
  );
}
