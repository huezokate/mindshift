import './Text.css';

export function Text({ as: Tag = 'p', variant = 'body', children, color }) {
  return (
    <Tag className={`ms-text ms-text--${variant} ${color ? `ms-text--${color}` : ''}`}>
      {children}
    </Tag>
  );
}
