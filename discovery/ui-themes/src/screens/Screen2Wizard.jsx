export function Screen2Wizard() {
  return (
    <div className="ms-screen">
      <div className="ms-back">← Back</div>

      <div className="ms-dots" style={{ marginTop: 8 }}>
        <span className="ms-dot" />
        <span className="ms-dot ms-dot--active" />
        <span className="ms-dot" />
        <span className="ms-dot" />
      </div>

      <div style={{ padding: '24px 40px 0', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ fontSize: 36, textAlign: 'center' }}>🌍</div>
        <p className="ms-step-label" style={{ margin: 0, fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textAlign: 'center', textTransform: 'uppercase' }}>
          Step 2 of 4
        </p>
        <h2 style={{ margin: '8px 0 0', fontSize: 24, fontWeight: 800, lineHeight: 1.25 }}>
          Where do you want to be in 5 years?
        </h2>
      </div>

      <textarea
        className="ms-textarea"
        rows={5}
        placeholder="Paint the picture. What does your ideal future look like?"
        style={{ marginTop: 24, width: 'calc(100% - 80px)' }}
        readOnly
      />

      <div style={{ display: 'flex', gap: 12, margin: '24px 40px 0' }}>
        <button className="ms-cta ms-cta-ghost" style={{ margin: 0, flex: 1 }}>← Previous</button>
        <button className="ms-cta" style={{ margin: 0, flex: 1 }}>Next →</button>
      </div>
    </div>
  );
}
