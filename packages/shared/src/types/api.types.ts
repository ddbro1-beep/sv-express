/**
 * API Response types
 */

export interface ApiSuccessResponse<T = any> {
  success: true;
  data: T;
}

export interface ApiErrorResponse {
  success: false;
  error: string;
  details?: any;
}

export type ApiResponse<T = any> = ApiSuccessResponse<T> | ApiErrorResponse;

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pages: number;
  limit: number;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}
