import { CircleAlert, Inbox } from 'lucide-react';

export default function EmptyState({ icon: Icon = Inbox, title, children, actions, tone }) {
  return (
    <div className={`empty-state${tone === 'error' ? ' empty-state--error' : ''}`} role={tone === 'error' ? 'alert' : undefined}>
      <div className="empty-state__icon">
        <Icon size={26} aria-hidden="true" />
      </div>
      <h3>{title}</h3>
      {children && <p>{children}</p>}
      {actions && <div className="empty-state__actions">{actions}</div>}
    </div>
  );
}

export function ErrorState({ title = 'Something went wrong', children, actions }) {
  return (
    <EmptyState icon={CircleAlert} tone="error" title={title} actions={actions}>
      {children}
    </EmptyState>
  );
}
