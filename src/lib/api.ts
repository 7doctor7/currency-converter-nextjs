import { ExchangeRate, CachedRates } from '@/types/currency';

// Конфигурация из переменных окружения
const API_URL = process.env.NEXT_PUBLIC_API_URL;
const API_KEY = process.env.NEXT_PUBLIC_API_KEY;
const CACHE_KEY = process.env.NEXT_PUBLIC_CACHE_KEY;
const CACHE_DURATION = parseInt(process.env.NEXT_PUBLIC_CACHE_DURATION || '300000'); // 5 minutes

export class CurrencyAPI {
  private static instance: CurrencyAPI;

  static getInstance(): CurrencyAPI {
    if (!CurrencyAPI.instance) {
      CurrencyAPI.instance = new CurrencyAPI();
    }

    return CurrencyAPI.instance;
  }

  async fetchRates(): Promise<ExchangeRate> {
    try {
      if (!API_URL || !API_KEY) {
        throw new Error('API key is required for FXRatesAPI.');
      }

      const url = new URL(API_URL);

      url.searchParams.set('api_key', API_KEY);
      url.searchParams.set('base', 'EUR');

      const response = await fetch(url.toString());

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(`API Error: ${data.error.info || data.error.message}`);
      }

      const timestamp = Date.now();
      const exchangeRate: ExchangeRate = {
        base: data.base || 'EUR',
        rates: data.rates || {},
        timestamp,
      };

      this.cacheRates(exchangeRate);

      return exchangeRate;
    } catch (error) {
      console.error('Failed to fetch rates:', error);

      const cached = this.getCachedRates();

      if (cached) {
        return {
          base: cached.base,
          rates: cached.rates,
          timestamp: cached.timestamp,
        };
      }

      throw error;
    }
  }

  getCachedRates(): CachedRates | null {
    try {
      if (!CACHE_KEY) {
        throw new Error('Key is required for cache.');
      }

      const cached = localStorage.getItem(CACHE_KEY);

      if (!cached) return null;

      return JSON.parse(cached) as CachedRates;
    } catch (error) {
      console.error('Failed to parse cached rates:', error);
      return null;
    }
  }

  isCacheValid(): boolean {
    const cached = this.getCachedRates();

    if (!cached) return false;

    return Date.now() < cached.expiresAt;
  }

  private cacheRates(rates: ExchangeRate): void {
    try {
      if (!CACHE_KEY) {
        throw new Error('Key is required for cache.');
      }

      const cachedRates: CachedRates = {
        ...rates,
        expiresAt: Date.now() + CACHE_DURATION,
      };

      localStorage.setItem(CACHE_KEY, JSON.stringify(cachedRates));
    } catch (error) {
      console.error('Failed to cache rates:', error);
    }
  }

  async getRatesWithCache(
    forceRefresh = false
  ): Promise<{ rates: ExchangeRate; fromCache: boolean; hasError?: boolean }> {
    if (!forceRefresh && this.isCacheValid()) {
      const cached = this.getCachedRates();

      if (cached) {
        return {
          rates: {
            base: cached.base,
            rates: cached.rates,
            timestamp: cached.timestamp,
          },
          fromCache: true,
          hasError: false,
        };
      }
    }

    // Fetch fresh data
    try {
      const rates = await this.fetchRates();
      return { rates, fromCache: false, hasError: false };
    } catch (error) {
      const cached = this.getCachedRates();

      if (cached) {
        return {
          rates: {
            base: cached.base,
            rates: cached.rates,
            timestamp: cached.timestamp,
          },
          fromCache: true,
          hasError: true,
        };
      }
      throw error;
    }
  }

  convertCurrency(amount: number, fromCode: string, toCode: string, rates: ExchangeRate): number {
    if (fromCode === toCode) return amount;

    const { base, rates: ratesData } = rates;

    if (fromCode === base) {
      return amount * (ratesData[toCode] || 1);
    }

    if (toCode === base) {
      return amount / (ratesData[fromCode] || 1);
    }

    const fromRate = ratesData[fromCode] || 1;
    const toRate = ratesData[toCode] || 1;

    return (amount / fromRate) * toRate;
  }

  getExchangeRate(fromCode: string, toCode: string, rates: ExchangeRate): number {
    if (fromCode === toCode) return 1;

    const { base, rates: ratesData } = rates;

    if (fromCode === base) {
      return ratesData[toCode] || 1;
    }

    if (toCode === base) {
      return 1 / (ratesData[fromCode] || 1);
    }

    const fromRate = ratesData[fromCode] || 1;
    const toRate = ratesData[toCode] || 1;

    return toRate / fromRate;
  }
}
