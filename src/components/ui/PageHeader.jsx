import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

export function Breadcrumbs({ items }) {
  return (
    <nav aria-label="Breadcrumb">
      <ol className="breadcrumbs">
        {items.map((item, i) => (
          <li key={item.label} className="cluster" style={{ gap: 6 }}>
            {i > 0 && <ChevronRight aria-hidden="true" />}
            {item.to ? <Link to={item.to}>{item.label}</Link> : <span aria-current="page">{item.label}</span>}
          </li>
        ))}
      </ol>
    </nav>
  );
}

export default function PageHeader({ eyebrow, eyebrowIcon: EyebrowIcon, title, description, actions, breadcrumbs }) {
  return (
    <>
      {breadcrumbs && <Breadcrumbs items={breadcrumbs} />}
      <header className="page-header">
        <div>
          {eyebrow && (
            <p className="page-header__eyebrow">
              {EyebrowIcon && <EyebrowIcon size={14} aria-hidden="true" />}
              {eyebrow}
            </p>
          )}
          <h1>{title}</h1>
          {description && <p>{description}</p>}
        </div>
        {actions && <div className="page-header__actions">{actions}</div>}
      </header>
    </>
  );
}
