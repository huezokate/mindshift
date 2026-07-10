export default function AppLayout({ children }: { children: React.ReactNode }) {
  // No fill — <body> paints var(--bg) + the theme surface texture.
  return (
    <div className="min-h-dvh">
      {children}
    </div>
  )
}
