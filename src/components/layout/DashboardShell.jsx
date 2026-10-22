import { Link } from 'react-router-dom';

/**
 * Sidebar + content layout shared by the patient, hospital and pharmacy dashboards.
 * `items` = [{ key, to, label, icon, active, count }]; `footer` renders under the nav.
 */
export default function DashboardShell({ identity, items, footer, label, children }) {
  return (
    <div className="container page dash">
      <aside className="dash__sidebar" aria-label={label}>
        {identity && <div className="dash__identity">{identity}</div>}
        <nav className="dash__nav">
          {items.map(({ key, to, label: itemLabel, icon: Icon, active, count }) => (
            <Link key={key ?? to} to={to} className={`dash__link${active ? ' active' : ''}`} aria-current={active ? 'page' : undefined}>
              <Icon size={17} aria-hidden="true" />
              <span>{itemLabel}</span>
              {count ? <span className="dash__count">{count}</span> : null}
            </Link>
          ))}
        </nav>
        {footer && <div className="dash__footer">{footer}</div>}
      </aside>
      <div className="dash__content">{children}</div>
    </div>
  );
}
