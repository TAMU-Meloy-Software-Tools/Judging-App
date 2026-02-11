import { auth0 } from '@/lib/auth0';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    try {
        const cookieStore = await cookies();
        const session = await auth0.getSession(req);
        
        if (!session?.user) {
            return NextResponse.json({ 
                error: 'Unauthorized' 
            }, { status: 401 });
        }

        const idToken = session.tokenSet?.idToken;
        if (!idToken) {
            return NextResponse.json({ 
                error: 'No token available' 
            }, { status: 401 });
        }

        return NextResponse.json({ token: idToken });
    } catch (error: any) {
        console.error('[Token API] Error:', error.message);
        return NextResponse.json({ 
            error: 'Failed to get token' 
        }, { status: 500 });
    }
}
