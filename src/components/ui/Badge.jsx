import { FlaskConical } from 'lucide-react';

export default function Badge({ tone = 'neutral', icon: Icon, children, className = '', ...rest }) {
  return (
    <span className={`badge badge--${tone} ${className}`} {...rest}>
      {Icon && <Icon aria-hidden="true" />}
      {children}
    </span>
  );
}

export function DemoBadge({ children = 'Demo data' }) {
  return (
    <span className="badge badge--demo" title="Simulated data for this prototype">
      <FlaskConical aria-hidden="true" />
      {children}
    </span>
  );
}
