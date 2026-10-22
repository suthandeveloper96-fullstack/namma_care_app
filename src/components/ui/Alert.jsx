import { CircleAlert, CircleCheck, FlaskConical, Info, TriangleAlert } from 'lucide-react';

const ICONS = {
  info: Info,
  success: CircleCheck,
  warning: TriangleAlert,
  danger: CircleAlert,
  demo: FlaskConical,
};

export default function Alert({ tone = 'info', title, children, icon, className = '', role, actions }) {
  const Icon = icon ?? ICONS[tone];
  return (
    <div className={`alert alert--${tone} ${className}`} role={role ?? (tone === 'danger' ? 'alert' : undefined)}>
      <Icon aria-hidden="true" />
      <div className="alert__body">
        {title && <p className="alert__title">{title}</p>}
        {children && <div>{children}</div>}
        {actions && (
          <div className="cluster" style={{ marginTop: 10 }}>
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}
