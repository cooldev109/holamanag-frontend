import i18n from './index';

export function money(
  amount: number,
  currency: string = 'USD',
  lng?: string
): string {
  const locale = lng || i18n.language;
  
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch (error) {
    // Fallback to USD if currency is not supported
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  }
}

export function date(
  value: Date | string,
  options?: Intl.DateTimeFormatOptions,
  lng?: string
): string {
  const locale = lng || i18n.language;
  const dateObj = typeof value === 'string' ? new Date(value) : value;
  
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  };
  
  try {
    return new Intl.DateTimeFormat(locale, { ...defaultOptions, ...options }).format(dateObj);
  } catch (error) {
    // Fallback to en-US if locale is not supported
    return new Intl.DateTimeFormat('en-US', { ...defaultOptions, ...options }).format(dateObj);
  }
}

export function shortDate(value: Date | string, lng?: string): string {
  return date(value, { month: 'numeric', day: 'numeric' }, lng);
}

export function fullDate(value: Date | string, lng?: string): string {
  return date(value, { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  }, lng);
}