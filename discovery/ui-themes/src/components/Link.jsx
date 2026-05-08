import './Link.css';

export function Link({ href = '#', children, variant = 'default' }) {
  return (
    <a className={`ms-link ms-link--${variant}`} href={href}>
      {children}
    </a>
  );
}
