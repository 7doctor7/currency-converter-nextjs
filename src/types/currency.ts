export interface Currency {
  code: string;
  name: string;
  symbol?: string;
  symbolNative?: string;
  decimalDigits?: number;
  rounding?: number;
  namePlural?: string;
  countryCodeISO2?: string;
  flagSrc?: string;
}

export interface ExchangeRate {
  base: string;
  rates: Record<string, number>;
  timestamp: number;
}

export interface CachedRates extends ExchangeRate {
  expiresAt: number;
}

export interface ConversionResult {
  amount: number;
  fromCurrency: Currency;
  toCurrency: Currency;
  convertedAmount: number;
  rate: number;
  inverseRate: number;
  timestamp: number;
}
