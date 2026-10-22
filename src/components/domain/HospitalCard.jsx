import { Link } from 'react-router-dom';
import { Building2, Clock, MapPin, Siren } from 'lucide-react';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import { formatDistance, formatHours, pluralize } from '../../utils/format';
import { isOpenAt } from '../../utils/hours';

/** `summary` = { total, available, busy, unknown } computed from resolved doctor statuses. */
export default function HospitalCard({ hospital, distanceKm, summary, specialties, now, compact = false }) {
  const open = isOpenAt(hospital.hours, now);

  if (compact) {
    return (
      <Link to={`/hospitals/${hospital.id}`} className="hospital-mini">
        <span className="icon-tile">
          <Building2 aria-hidden="true" />
        </span>
        <span className="hospital-mini__body">
          <strong>{hospital.name}</strong>
          <span className="text-xs subtle">
            {hospital.area}, {hospital.city}
          </span>
          <span className="text-xs subtle">
            {formatDistance(distanceKm)} · {summary.available} of {summary.total} doctors available
          </span>
          <span className="hospital-mini__link">View Details</span>
        </span>
      </Link>
    );
  }

  return (
    <article className="card card--interactive hospital-card">
      <div className="cluster cluster--between" style={{ alignItems: 'flex-start' }}>
        <div className="icon-tile" aria-hidden="true">
          <Building2 />
        </div>
        <div className="cluster">
          {hospital.emergency && (
            <Badge tone="danger" icon={Siren}>
              24×7 casualty (demo)
            </Badge>
          )}
          <Badge tone={open ? 'success' : 'neutral'}>{open ? 'Open now' : 'Closed now'}</Badge>
        </div>
      </div>
      <div>
        <p className="eyebrow-text">{hospital.type}</p>
        <h3 className="card-title">
          <Link to={`/hospitals/${hospital.id}`}>{hospital.name}</Link>
        </h3>
      </div>
      <div className="meta-row">
        <span>
          <MapPin aria-hidden="true" />
          {hospital.area}, {hospital.city} · {formatDistance(distanceKm)}
        </span>
        <span>
          <Clock aria-hidden="true" />
          {formatHours(hospital.hours)}
        </span>
      </div>
      {specialties?.length > 0 && <p className="text-sm muted">{specialties.map((s) => s.name).join(' · ')}</p>}
      <div className="status-summary" aria-label="Doctor status summary (demo)">
        <span className="status-summary__item status-summary__item--available">
          <strong>{summary.available}</strong> available
        </span>
        <span className="status-summary__item status-summary__item--busy">
          <strong>{summary.busy}</strong> busy / delayed
        </span>
        <span className="status-summary__item status-summary__item--unknown">
          <strong>{summary.unknown}</strong> away / unknown
        </span>
      </div>
      <div className="cluster cluster--between">
        <span className="text-sm subtle">{pluralize(summary.total, 'doctor')} listed</span>
        <div className="cluster">
          <Button to={`/hospitals/${hospital.id}`} size="sm" variant="outline">
            View Details
          </Button>
          <Button to={`/doctors?hospital=${hospital.id}`} size="sm" variant="primary">
            Find Doctors
          </Button>
        </div>
      </div>
    </article>
  );
}
