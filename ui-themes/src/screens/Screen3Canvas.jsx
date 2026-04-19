const NODES = [
  { emoji: '💼', label: 'Career',        top: '22%', left: '6%'  },
  { emoji: '🎨', label: 'Creativity',    top: '16%', left: '58%' },
  { emoji: '💰', label: 'Finances',      top: '40%', left: '1%'  },
  { emoji: '🌿', label: 'Health',        top: '40%', left: '72%' },
  { emoji: '✈️', label: 'Travel',        top: '62%', left: '6%'  },
  { emoji: '💞', label: 'Relationships', top: '62%', left: '58%' },
];

export function Screen3Canvas() {
  return (
    <div className="ms-screen">
      <div className="ms-back">← Back</div>

      <div className="ms-canvas-area" style={{ margin: '8px 0 0', flex: 1, position: 'relative', minHeight: 600 }}>
        {/* Hub */}
        <div className="ms-node ms-node--hub" style={{ position: 'absolute', top: '44%', left: '33%', transform: 'translate(-50%, -50%)' }}>
          In 5 years…
        </div>

        {/* Life nodes */}
        {NODES.map(n => (
          <div key={n.label} className="ms-node" style={{ top: n.top, left: n.left }}>
            <span>{n.emoji}</span>
            <span>{n.label}</span>
          </div>
        ))}

        {/* Zoom controls */}
        <div className="ms-zoom">
          <button>+</button>
          <button>−</button>
          <button>⊙</button>
        </div>
      </div>

      <div style={{ padding: '12px 0 20px' }}>
        <button className="ms-cta">Choose Your Lens →</button>
      </div>
    </div>
  );
}
