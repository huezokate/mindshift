import './Card.css';

export function Card({ title, subtitle, tag, children, accent, onClick }) {
  return (
    <div className={`ms-card ${accent ? `ms-card--${accent}` : ''} ${onClick ? 'ms-card--clickable' : ''}`} onClick={onClick}>
      {tag && <span className="ms-card__tag">{tag}</span>}
      {title && <h3 className="ms-card__title">{title}</h3>}
      {subtitle && <p className="ms-card__subtitle">{subtitle}</p>}
      {children && <div className="ms-card__body">{children}</div>}
    </div>
  );
}
