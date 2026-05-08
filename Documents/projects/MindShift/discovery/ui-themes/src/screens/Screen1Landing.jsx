export function Screen1Landing() {
  return (
    <div className="ms-screen">
      <div style={{ padding: '110px 40px 0', display: 'flex', flexDirection: 'column', gap: 8 }}>
        <p style={{ margin: 0, fontSize: 32, fontWeight: 800, letterSpacing: '0.04em' }}
           className="ms-display-text">
          🧠 MindShift
        </p>
        <p style={{ margin: 0, fontSize: 15, lineHeight: 1.5 }} className="ms-subtitle-text">
          Same situation. Different minds.<br />New possibilities.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 36 }}>
        <div className="ms-flow-card">
          <span className="ms-flow-card__emoji">🗺️</span>
          <h3 className="ms-flow-card__title">Map My Future</h3>
          <p className="ms-flow-card__body">
            Build a personalised mind map of your life in 5 years — then explore how to get there.
          </p>
          <span className="ms-flow-card__cta">Start mapping →</span>
        </div>

        <div className="ms-flow-card">
          <span className="ms-flow-card__emoji">🔮</span>
          <h3 className="ms-flow-card__title">Shift My Perspective</h3>
          <p className="ms-flow-card__body">
            Have something on your mind? Vent it out, then see it through the lens of a historical figure.
          </p>
          <span className="ms-flow-card__cta">Try a lens →</span>
        </div>
      </div>
    </div>
  );
}
