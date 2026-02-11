/**
 * Sponsors API endpoints
 */

import { get, post, put, del } from './client';

export interface Sponsor {
    id: string;
    name: string;
    logo_url: string | null;
    website_url?: string | null;
    tier?: string | null;
    primary_color: string;
    secondary_color: string;
    text_color: string;
    created_at?: string;
}

/**
 * Create a new sponsor
 */
export async function createSponsor(data: {
    name: string;
    logo_url?: string | null;
    website_url?: string | null;
    tier?: string | null;
    primary_color?: string;
    secondary_color?: string;
    text_color?: string;
}): Promise<{ sponsor: Sponsor }> {
    return post<{ sponsor: Sponsor }>('/sponsors', data);
}

/**
 * Update a sponsor
 */
export async function updateSponsor(
    sponsorId: string,
    data: Partial<Sponsor>
): Promise<{ sponsor: Sponsor }> {
    return put<{ sponsor: Sponsor }>(`/sponsors/${sponsorId}`, data);
}

/**
 * Delete a sponsor
 */
export async function deleteSponsor(sponsorId: string): Promise<void> {
    return del<void>(`/sponsors/${sponsorId}`);
}
