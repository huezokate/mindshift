import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

const APP_HOST = 'app.minds-shift.com'
const APEX_HOST = 'minds-shift.com'

// Mind map is account-bound (maps persist per user_id) — gate the pages here.
// The /api/mindmap/* routes self-check via getUserTier() and return JSON 401s,
// so they're deliberately NOT in this matcher (auth.protect() would 404 a fetch
// instead of giving the client a handleable error).
const isProtectedRoute = createRouteMatcher([
  '/app/journal-v2',
  '/app/journal-v2/:path*',
  '/app/mindmap',
  '/app/mindmap/:path*',
])
const isAppOrAuthPath = createRouteMatcher(['/app/:path*', '/sign-in/:path*', '/sign-up/:path*'])

export default clerkMiddleware(async (auth, req) => {
  const host = req.headers.get('host') ?? ''
  const { pathname, search } = req.nextUrl

  if (host === APEX_HOST && isAppOrAuthPath(req)) {
    return NextResponse.redirect(new URL(pathname + search, `https://${APP_HOST}`), 308)
  }

  if (host === APP_HOST && pathname === '/') {
    return NextResponse.redirect(new URL('/app/theme-select', `https://${APP_HOST}`), 308)
  }

  if (isProtectedRoute(req)) await auth.protect()
})

export const config = {
  matcher: ['/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)', '/(api|trpc)(.*)'],
}
