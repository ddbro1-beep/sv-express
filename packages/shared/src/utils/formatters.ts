/**
 * Common formatting utilities
 */

export const formatPrice = (price: number, currency: string = 'EUR'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(price);
};

export const formatWeight = (weightKg: number): string => {
  if (weightKg < 1) {
    return `${(weightKg * 1000).toFixed(0)}g`;
  }
  return `${weightKg.toFixed(2)}kg`;
};

export const formatDate = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(dateObj);
};

export const formatDateTime = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(dateObj);
};

export const formatTrackingNumber = (trackingNumber: string): string => {
  return trackingNumber.toUpperCase();
};

export const generateTrackingNumber = (): string => {
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 100000).toString().padStart(5, '0');
  return `SV-${year}-${random}`;
};
