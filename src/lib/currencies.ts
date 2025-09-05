import { Currency } from '@/types/currency';

let currenciesCache: Currency[] | null = null;
let loadingPromise: Promise<Currency[]> | null = null;
let isLoading = false;

export async function loadCurrencies(): Promise<Currency[]> {
  if (currenciesCache) {
    return currenciesCache;
  }

  if (loadingPromise) {
    return loadingPromise;
  }

  if (isLoading) {
    return getFallbackCurrencies();
  }

  loadingPromise = (async () => {
    try {
      isLoading = true;

      const response = await fetch('/currencies.json');

      if (!response.ok) {
        throw new Error(`Failed to load currencies: ${response.status} ${response.statusText}`);
      }

      const currenciesData = await response.json();

      currenciesCache = currenciesData.map((currency: Currency) => ({
        code: currency.code,
        name: currency.name,
        symbol: currency.symbol,
        symbolNative: currency.symbolNative,
        decimalDigits: currency.decimalDigits,
        rounding: currency.rounding,
        namePlural: currency.namePlural,
        countryCodeISO2: currency.countryCodeISO2,
        flagSrc: currency.flagSrc,
      }));

      return currenciesCache!;
    } catch (error) {
      console.error('Error loading currencies:', error);

      const fallbackCurrencies = getFallbackCurrencies();

      currenciesCache = fallbackCurrencies;

      return fallbackCurrencies;
    }
  })();

  loadingPromise.finally(() => {
    loadingPromise = null;
    isLoading = false;
  });

  return loadingPromise;
}

function getFallbackCurrencies(): Currency[] {
  return [
    { code: 'USD', name: 'US Dollar', symbol: '$' },
    { code: 'EUR', name: 'Euro', symbol: '€' },
    { code: 'GBP', name: 'British Pound Sterling', symbol: '£' },
    { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
    { code: 'CHF', name: 'Swiss Franc', symbol: 'Fr' },
    { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
    { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
    { code: 'CNY', name: 'Chinese Yuan', symbol: '¥' },
    { code: 'SEK', name: 'Swedish Krona', symbol: 'kr' },
    { code: 'NOK', name: 'Norwegian Krone', symbol: 'kr' },
  ];
}

export function getCachedCurrencies(): Currency[] {
  if (!currenciesCache) {
    throw new Error('Currencies not loaded yet. Call loadCurrencies() first.');
  }

  return currenciesCache;
}

export const getCurrencyByCode = (code: string, currencies: Currency[]): Currency | undefined => {
  return currencies.find(currency => currency.code === code);
};

export const getDefaultCurrencies = (currencies: Currency[]): { from: Currency; to: Currency } => {
  return {
    from: getCurrencyByCode('USD', currencies) || currencies[0],
    to: getCurrencyByCode('EUR', currencies) || currencies[1],
  };
};
