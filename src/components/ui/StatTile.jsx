import { Link } from 'react-router-dom';

/** Small KPI tile; renders as a link when `to` is provided. */
export default function StatTile({ icon: Icon, label, value, to }) {
  const content = (
    <>
      <span className="icon-tile icon-tile--sm">
        <Icon aria-hidden="true" />
      </span>
      <span>
        <strong className="stat-tile__value">{value}</strong>
        <span className="text-sm muted">{label}</span>
      </span>
    </>
  );
  return to ? (
    <Link to={to} className="stat-tile stat-tile--link">
      {content}
    </Link>
  ) : (
    <div className="stat-tile">{content}</div>
  );
}
