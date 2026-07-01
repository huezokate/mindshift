/**
 * Storybook-only mock for `@clerk/nextjs` (T-022-04).
 *
 * The `@storybook/nextjs-vite` framework mocks `next/navigation` for us, but it
 * knows nothing about Clerk — so components that call `useUser()` / `useClerk()`
 * (AppHeader, EntryAuthRow, ChatScreen, and anything that nests them) crash on
 * mount inside the isolated iframe. `.storybook/main.ts` aliases the bare
 * `@clerk/nextjs` import to THIS file for the Storybook build only; the real app
 * bundle (`next build`) never sees it.
 *
 * State is a module singleton because the alias binds a single static module.
 * A story flips signed-in/out declaratively via `parameters.clerk`, which the
 * global decorator in `preview.tsx` pushes into `__setClerkState` before each
 * render. Example:
 *
 *   export const SignedOut: Story = {
 *     parameters: { clerk: { signedIn: false } },
 *   }
 */
import * as React from 'react'

export type MockUser = {
  id: string
  firstName: string | null
  lastName: string | null
  username: string | null
  primaryEmailAddress: { emailAddress: string } | null
  imageUrl: string
}

export type ClerkState = {
  signedIn: boolean
  user: MockUser | null
  isLoaded: boolean
}

// Default identity used whenever a story is signed-in but doesn't supply its own
// user. Fields cover every property the six flagged components read.
const DEFAULT_USER: MockUser = {
  id: 'user_mock_ada',
  firstName: 'Ada',
  lastName: 'Lovelace',
  username: 'ada',
  primaryEmailAddress: { emailAddress: 'ada@minds-shift.com' },
  imageUrl: '/portraits/notepad/marilyn-monroe.png',
}

// The live singleton. Defaults to signed-in + loaded so an unconfigured story is
// deterministic rather than stuck in a loading state.
let state: ClerkState = { signedIn: true, user: DEFAULT_USER, isLoaded: true }

/**
 * Storybook-internal control (NOT part of the Clerk API). The preview decorator
 * calls this with `parameters.clerk` each render; passing `undefined` resets to
 * the signed-in default so state never bleeds between stories.
 */
export function __setClerkState(partial?: Partial<ClerkState>): void {
  if (!partial) {
    state = { signedIn: true, user: DEFAULT_USER, isLoaded: true }
    return
  }
  const signedIn = partial.signedIn ?? state.signedIn
  state = {
    signedIn,
    isLoaded: partial.isLoaded ?? true,
    // When flipping to signed-in without an explicit user, fall back to the demo.
    user: partial.user ?? (signedIn ? DEFAULT_USER : null),
  }
}

const noop = () => {}
const asyncNoop = async () => {}

// ── The `@clerk/nextjs` surface the app imports ──────────────────────────────

/** Mirrors Clerk's `useUser()` shape. `user` is null while signed-out. */
export function useUser() {
  return {
    isLoaded: state.isLoaded,
    isSignedIn: state.signedIn,
    user: state.signedIn ? state.user : null,
  }
}

/** Mirrors `useAuth()`. Defensive extra — not read by the six components today. */
export function useAuth() {
  return {
    isLoaded: state.isLoaded,
    isSignedIn: state.signedIn,
    userId: state.signedIn ? state.user?.id ?? null : null,
    sessionId: state.signedIn ? 'sess_mock' : null,
    signOut: asyncNoop,
  }
}

/** Mirrors `useClerk()`. AppHeader destructures `signOut`; the rest are stubs. */
export function useClerk() {
  return {
    signOut: asyncNoop,
    openSignIn: noop,
    openUserProfile: noop,
    openSignUp: noop,
  }
}

// Passthrough component stubs. Typed loosely because they're render shims, not
// the real Clerk components — stories only need them not to throw.
/* eslint-disable @typescript-eslint/no-explicit-any */
export function ClerkProvider({ children }: { children?: React.ReactNode }) {
  return <>{children}</>
}
export function SignedIn({ children }: { children?: React.ReactNode }) {
  return state.signedIn ? <>{children}</> : null
}
export function SignedOut({ children }: { children?: React.ReactNode }) {
  return state.signedIn ? null : <>{children}</>
}
export function UserButton(_props: any) {
  return <span data-mock="clerk-user-button" aria-hidden />
}
export function SignInButton({ children }: any) {
  return <>{children ?? <button type="button">Sign in</button>}</>
}
export function SignUpButton({ children }: any) {
  return <>{children ?? <button type="button">Sign up</button>}</>
}
/* eslint-enable @typescript-eslint/no-explicit-any */
