/**
 * Base API client for making HTTP requests
 */

// Use local proxy for authenticated calls
const API_URL = '/api/proxy';

if (!API_URL && typeof window !== 'undefined') {
    console.warn('NEXT_PUBLIC_API_URL is not set');
}

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

export async function apiCall<T>(
    endpoint: string,
    options?: RequestInit
): Promise<T> {
    const url = `${API_URL}${endpoint}`;

    try {
        const response = await fetch(url, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options?.headers,
            },
        });

        // Handle non-JSON responses (like 204 No Content)
        if (response.status === 204) {
            return {} as T;
        }

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
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
