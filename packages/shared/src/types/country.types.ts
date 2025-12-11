/**
 * Country-related types
 */

export type CountryRegion = 'eu' | 'cis';

export interface Country {
  id: number;
  code: string;
  nameEn: string;
  nameRu: string;
  region: CountryRegion;
  isOrigin: boolean;
  isDestination: boolean;
  createdAt: string;
}
