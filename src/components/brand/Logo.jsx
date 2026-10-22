import { Link } from 'react-router-dom';

export function LogoMark({ size = 34, inverted = false }) {
  const bg = inverted ? '#ffffff' : '#1a72d6';
  const fg = inverted ? '#1a72d6' : '#ffffff';
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true" focusable="false">
      <rect width="32" height="32" rx="9" fill={bg} />
      <path
        d="M16 26.5S5 20 5 12.6C5 9 7.8 6.2 11.2 6.2c2 0 3.7 1 4.8 2.5 1.1-1.5 2.8-2.5 4.8-2.5C24.2 6.2 27 9 27 12.6 27 20 16 26.5 16 26.5z"
        fill={fg}
      />
      <rect x="14.4" y="10.5" width="3.2" height="9.5" rx="1" fill={bg} />
      <rect x="11.25" y="13.65" width="9.5" height="3.2" rx="1" fill={bg} />
    </svg>
  );
}

export default function Logo({ inverted = false, to = '/' }) {
  return (
    <Link to={to} className={`logo${inverted ? ' logo--inverted' : ''}`} aria-label="NammaCare home">
      <LogoMark inverted={inverted} />
      <span className="logo__word">
        Namma<span>Care</span>
      </span>
    </Link>
  );
}
