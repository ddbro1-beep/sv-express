/**
 * Common validation utilities
 */

export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isValidPhone = (phone: string): boolean => {
  // International phone format: +[country code][number]
  const phoneRegex = /^\+[1-9]\d{1,14}$/;
  return phoneRegex.test(phone.replace(/[\s-]/g, ''));
};

export const isValidPostalCode = (postalCode: string, countryCode?: string): boolean => {
  if (!postalCode) return false;

  // Basic validation - alphanumeric, spaces, hyphens
  const basicRegex = /^[A-Z0-9\s-]{3,10}$/i;
  return basicRegex.test(postalCode);
};

export const isValidWeight = (weight: number): boolean => {
  return weight > 0 && weight <= 100; // Max 100kg
};

export const isValidPrice = (price: number): boolean => {
  return price > 0 && price <= 10000; // Max 10000 EUR
};
