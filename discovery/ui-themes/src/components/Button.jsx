import './Button.css';

export function Button({ variant = 'primary', size = 'md', children, disabled, onClick }) {
  return (
    <button
      className={`ms-btn ms-btn--${variant} ms-btn--${size}`}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
