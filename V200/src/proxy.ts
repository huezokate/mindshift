import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

const APP_HOST = 'app.minds-shift.com'
const APEX_HOST = 'minds-shift.com'

const isProtectedRoute = createRouteMatcher(['/app/journal'])
const isAppOrAuthPath = createRouteMatcher(['/app/:path*', '/sign-in/:path*', '/sign-up/:path*'])

export default clerkMiddleware(async (auth, req) => {
  const host = req.headers.get('host') ?? ''
  const { pathname, search } = req.nextUrl

  if (host === APEX_HOST && isAppOrAuthPath(req)) {
    return NextResponse.redirect(new URL(pathname + search, `https://${APP_HOST}`), 308)
  }

  if (host === APP_HOST && pathname === '/') {
    return NextResponse.redirect(new URL('/app/choose-ui', `https://${APP_HOST}`), 308)
  }

  if (isProtectedRoute(req)) await auth.protect()
})

export const config = {
  matcher: ['/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)', '/(api|trpc)(.*)'],
}
