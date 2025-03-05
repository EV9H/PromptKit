import { NextResponse, type NextRequest } from 'next/server';
import { updateSession } from "@/utils/supabase/middleware";

export async function middleware(request: NextRequest) {
  const response = await updateSession(request);
  const pathname = request.nextUrl.pathname;

  // Store the current path in a cookie if it's a prompts page (but not a detail page)
  if (pathname.includes('/prompts') &&
    !(pathname.startsWith('/prompts/') && pathname.split('/').length === 3)) {

    // Store the full URL (path + search params)
    const fullUrl = pathname + request.nextUrl.search;

    // Set a cookie with the current URL
    response.cookies.set('lastPromptsPage', fullUrl, {
      path: '/',
      maxAge: 3600, // 1 hour
      httpOnly: true,
      sameSite: 'lax'
    });
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images - .svg, .png, .jpg, .jpeg, .gif, .webp
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    // Match all paths that start with /prompts
    '/prompts/:path*',
  ],
};
