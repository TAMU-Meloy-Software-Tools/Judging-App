import { auth0 } from '@/lib/auth0';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

async function handleProxy(req: NextRequest, path: string[], method: string) {
    try {
        // Get Auth0 session - pass the request for cookie access
        const session = await auth0.getSession(req);
        
        if (!session?.user) {
            return NextResponse.json({ 
                error: 'Unauthorized - Not authenticated' 
            }, { status: 401 });
        }

        // In v4, tokens are nested under tokenSet
        const idToken = session.tokenSet?.idToken;

        if (!idToken) {
            return NextResponse.json({ 
                error: 'Unauthorized - No ID token' 
            }, { status: 401 });
        }

        // Build backend URL with query parameters
        const backendPath = path.join('/');
        const searchParams = req.nextUrl.searchParams.toString();
        const backendUrl = `${process.env.NEXT_PUBLIC_API_URL}/${backendPath}${searchParams ? `?${searchParams}` : ''}`;

        // Get request body for non-GET requests
        let body = undefined;
        if (method !== 'GET' && method !== 'DELETE') {
            const text = await req.text();
            body = text || undefined;
        }

        // Forward request to Lambda with Auth0 ID token (JWT)
        const response = await fetch(backendUrl, {
            method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${idToken}`,
            },
            body,
        });

        // Parse response
        const data = await response.json().catch(() => ({}));
        
        return NextResponse.json(data, { status: response.status });

    } catch (error: any) {
        console.error('[Backend Proxy] Error:', error);
        return NextResponse.json({ 
            error: 'Proxy error',
            details: error.message 
        }, { status: 500 });
    }
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
    const { path } = await params;
    return handleProxy(req, path, 'GET');
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
    const { path } = await params;
    return handleProxy(req, path, 'POST');
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
    const { path } = await params;
    return handleProxy(req, path, 'PUT');
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
    const { path } = await params;
    return handleProxy(req, path, 'PATCH');
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
    const { path } = await params;
    return handleProxy(req, path, 'DELETE');
}
