export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh" style={{ background: 'var(--bg)' }}>
      {children}
    </div>
  )
}
