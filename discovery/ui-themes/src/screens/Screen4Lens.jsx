const PERSONAS = [
  { emoji: '🧙‍♂️', name: 'Socrates',       desc: 'Questions your assumptions and surfaces unconscious beliefs' },
  { emoji: '🔮',   name: 'Future You',     desc: 'Looking back from 10 years ahead with clarity and perspective' },
  { emoji: '🎭',   name: 'Alter Ego',      desc: 'Acts without overthinking, chooses visibility, takes bold risks' },
  { emoji: '🌱',   name: 'Gentle Realist', desc: 'Burnout-aware, sustainable pacing, nervous-system friendly' },
];

export function Screen4Lens() {
  return (
    <div className="ms-screen">
      <div className="ms-back">← Back</div>

      <div style={{ padding: '16px 40px 0' }}>
        <h2 style={{ margin: '0 0 8px', fontSize: 24, fontWeight: 800 }}>Choose Your Lens</h2>
        <p style={{ margin: 0, fontSize: 13, lineHeight: 1.5 }} className="ms-muted-text">
          Each persona will reinterpret your map with different priorities and first steps.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, margin: '20px 40px 0' }}>
        {PERSONAS.map(p => (
          <div key={p.name} className="ms-persona-card">
            <span className="ms-persona-card__emoji">{p.emoji}</span>
            <p className="ms-persona-card__name">{p.name}</p>
            <p className="ms-persona-card__desc">{p.desc}</p>
          </div>
        ))}
      </div>

      <div style={{ margin: '16px 40px 0', padding: '16px', display: 'flex', flexDirection: 'column', gap: 10 }}
           className="ms-insight-block">
        <p style={{ margin: 0, fontSize: 13, fontWeight: 700 }}>🌟 Or choose any historical figure</p>
        <p style={{ margin: 0, fontSize: 12 }} className="ms-muted-text">Who would you want to hear from?</p>
        <input className="ms-input" placeholder="e.g., Marcus Aurelius, Maya Angelou…" readOnly />
        <button className="ms-cta" style={{ margin: 0, width: '100%' }}>Explore Their Perspective →</button>
      </div>
    </div>
  );
}
