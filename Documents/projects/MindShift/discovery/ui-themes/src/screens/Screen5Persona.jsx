export function Screen5Persona() {
  return (
    <div className="ms-screen">
      {/* Top quote bar */}
      <div className="ms-persona-bar">
        <span style={{ fontSize: 22 }}>🧙‍♂️</span>
        <span>"Unexamined assumptions often block the path forward."</span>
      </div>

      {/* Question context */}
      <div className="ms-question-ctx">
        <p className="ms-question-ctx__label">Your Question</p>
        <p className="ms-question-ctx__text">Should I quit my corporate job to pursue creative work?</p>
      </div>

      {/* Perspective heading */}
      <div style={{ padding: '4px 40px 8px' }}>
        <h3 style={{ margin: '0 0 6px', fontSize: 18, fontWeight: 800 }}>✨ Socrates' Perspective</h3>
        <p style={{ margin: 0, fontSize: 13, lineHeight: 1.6 }} className="ms-muted-text">
          The unexamined life is not worth living. Let's question what you truly want before choosing a path.
        </p>
      </div>

      {/* Core questions block */}
      <div className="ms-insight-block">
        <p className="ms-insight-block__title">Core Questions to Sit With</p>
        <p className="ms-insight-block__body">
          • What does "success" mean to you — and who taught you that definition?<br />
          • Is it the job you want to leave, or the version of yourself in that job?<br />
          • What would you do if failure was impossible?
        </p>
      </div>

      {/* Socratic challenge block */}
      <div className="ms-insight-block">
        <p className="ms-insight-block__title">The Socratic Challenge</p>
        <p className="ms-insight-block__body">
          Before leaping, examine the fear. Is it the risk of failing — or the risk of succeeding and finding it still isn't enough?
        </p>
      </div>

      {/* Bottom CTA */}
      <div style={{ marginTop: 'auto', paddingBottom: 28, paddingTop: 16 }}>
        <button className="ms-cta ms-cta-ghost">← Try Another Lens</button>
      </div>
    </div>
  );
}
