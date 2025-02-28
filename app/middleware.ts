import { updateSession } from '@/app/supabase/middleware'
import { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
    // Update user's auth session
    return await updateSession(request)
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public (public files)
         */
        '/((?!_next/static|_next/image|favicon.ico|public).*)',
    ],
} 