/**
 * Base API client for making HTTP requests
 */

// Get API URL from Next.js env config (with fallback)
const API_URL: string = process.env.NEXT_PUBLIC_API_URL || 'https://o90rhtv5i4.execute-api.us-east-1.amazonaws.com/prod';

if (!process.env.NEXT_PUBLIC_API_URL) {
    console.warn('NEXT_PUBLIC_API_URL not set, using fallback URL');
}

// Cache for the auth token
let cachedToken: string | null = null;

export class ApiError extends Error {
    constructor(
        message: string,
        public statusCode?: number,
        public response?: any
    ) {
        super(message);
        this.name = 'ApiError';
    }
}

/**
 * Get the Auth0 ID token from the server
 */
async function getAuthToken(): Promise<string> {
    if (cachedToken) {
        return cachedToken;
    }

    const response = await fetch('/api/token');
    if (!response.ok) {
        throw new ApiError('Failed to get auth token', response.status);
    }

    const data = await response.json();
    cachedToken = data.token;
    
    if (!cachedToken) {
        throw new ApiError('No token received from server');
    }
    
    return cachedToken;
}

export async function apiCall<T>(
    endpoint: string,
    options?: RequestInit
): Promise<T> {
    const url = `${API_URL}${endpoint}`;

    try {
        // Get auth token
        const token = await getAuthToken();

        const response = await fetch(url, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
                ...options?.headers,
            },
        });

        // Handle non-JSON responses (like 204 No Content)
        if (response.status === 204) {
            return {} as T;
        }

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
            // Clear cached token on 401
            if (response.status === 401) {
                cachedToken = null;
            }

            throw new ApiError(
                data.error || `API request failed with status ${response.status}`,
                response.status,
                data
            );
        }

        return data as T;
    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }

        // Network or other errors
        throw new ApiError(
            error instanceof Error ? error.message : 'Network error occurred'
        );
    }
}

/**
 * Helper for GET requests
 */
export async function get<T>(endpoint: string): Promise<T> {
    return apiCall<T>(endpoint, { method: 'GET' });
}

/**
 * Helper for POST requests
 */
export async function post<T>(endpoint: string, data?: any): Promise<T> {
    return apiCall<T>(endpoint, {
        method: 'POST',
        body: data ? JSON.stringify(data) : undefined,
    });
}

/**
 * Helper for PUT requests
 */
export async function put<T>(endpoint: string, data?: any): Promise<T> {
    return apiCall<T>(endpoint, {
        method: 'PUT',
        body: data ? JSON.stringify(data) : undefined,
    });
}

/**
 * Helper for PATCH requests
 */
export async function patch<T>(endpoint: string, data?: any): Promise<T> {
    return apiCall<T>(endpoint, {
        method: 'PATCH',
        body: data ? JSON.stringify(data) : undefined,
    });
}

/**
 * Helper for DELETE requests
 */
export async function del<T>(endpoint: string, data?: any): Promise<T> {
    return apiCall<T>(endpoint, {
        method: 'DELETE',
        body: data ? JSON.stringify(data) : undefined,
    });
}
