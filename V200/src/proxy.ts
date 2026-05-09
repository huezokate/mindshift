import { clerkMiddleware } from '@clerk/nextjs/server'

// No routes are hard-gated. Auth is checked per-action (save, chat, extra queries).
export default clerkMiddleware()

export const config = {
  matcher: ['/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)', '/(api|trpc)(.*)'],
}
