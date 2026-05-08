import './Chip.css';

export function Chip({ label, color = 'default', onRemove }) {
  return (
    <span className={`ms-chip ms-chip--${color}`}>
      {label}
      {onRemove && (
        <button className="ms-chip__remove" onClick={onRemove} aria-label="remove">×</button>
      )}
    </span>
  );
}
