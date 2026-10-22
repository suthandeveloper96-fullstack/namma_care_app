import { Clock } from 'lucide-react';
import { formatRelative } from '../../utils/format';

export function DoctorStatusBadge({ status }) {
  let label = status.label;
  if (status.stale) label = 'Status Unknown';
  else if (status.key === 'delayed' && status.delayMinutes) label = `Delayed ~${status.delayMinutes} min`;
  return (
    <span className={`status status--${status.key}`}>
      <span className="status__dot" aria-hidden="true" />
      {label}
    </span>
  );
}

/** "Demo update: 5 min ago" — always shown next to a status so it is never mistaken for live data. */
export function StatusTimestamp({ status, now }) {
  if (!status.updatedAt) {
    return (
      <span className="status-meta">
        <Clock aria-hidden="true" /> No demo update available
      </span>
    );
  }
  return (
    <span className="status-meta" title={new Date(status.updatedAt).toLocaleString('en-IN')}>
      <Clock aria-hidden="true" />
      {status.stale ? 'Last demo update ' : 'Demo update: '}
      {formatRelative(status.updatedAt, now.getTime())}
      {status.stale && ' — may be outdated'}
    </span>
  );
}
