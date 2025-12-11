/**
 * User-related types
 */

export type UserRole = 'admin' | 'customer';

export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  role: UserRole;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
}

export interface CreateUserDTO {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  role?: UserRole;
}

export interface UpdateUserDTO {
  firstName?: string;
  lastName?: string;
  phone?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  token: string;
}
