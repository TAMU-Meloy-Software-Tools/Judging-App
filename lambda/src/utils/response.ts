import { ApiResponse } from '../types';

/**
 * Standardized API response helpers
 */

const CORS_HEADERS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*', // Will be configured via API Gateway CORS
  'Access-Control-Allow-Headers': 'Content-Type,Authorization',
  'Access-Control-Allow-Methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
};

export function successResponse<T>(data: T, statusCode: number = 200): ApiResponse {
  return {
    statusCode,
    headers: CORS_HEADERS,
    body: JSON.stringify(data),
  };
}

export function errorResponse(
  error: string,
  statusCode: number = 500,
  details?: any
): ApiResponse {
  // Don't expose internal error details in production
  const body = {
    error,
    ...(process.env.NODE_ENV !== 'production' && details ? { details } : {}),
  };

  return {
    statusCode,
    headers: CORS_HEADERS,
    body: JSON.stringify(body),
  };
}

export function createdResponse<T>(data: T): ApiResponse {
  return successResponse(data, 201);
}

export function noContentResponse(): ApiResponse {
  return {
    statusCode: 204,
    headers: CORS_HEADERS,
    body: '',
  };
}
