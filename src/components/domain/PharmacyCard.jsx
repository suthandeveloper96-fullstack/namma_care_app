import { Link } from 'react-router-dom';
import { Bike, CircleCheck, CircleX, PackageCheck } from 'lucide-react';
import Button from '../ui/Button';
import { PharmacyLogo } from '../brand/Illustrations';
import { formatCurrency, formatDistance, formatHours, formatTime } from '../../utils/format';
import { isOpenAt } from '../../utils/hours';

function hoursLabel(hours, open) {
  if (hours.open24h) return 'Open 24 hours';
  return open ? `Open till ${formatTime(hours.close)}` : `Closed · opens ${formatTime(hours.open)}`;
}

/** Pharmacy list row (or compact item for the home page side panel). */
export default function PharmacyCard({ pharmacy, distanceKm, inStockCount, totalListed, now, compact = false }) {
  const open = isOpenAt(pharmacy.hours, now);
  const { delivery } = pharmacy;

  if (compact) {
    return (
      <Link to={`/pharmacies/${pharmacy.id}`} className="pharmacy-mini">
        <PharmacyLogo pharmacy={pharmacy} size={40} />
        <span className="pharmacy-mini__body">
          <strong>{pharmacy.name}</strong>
          <span className="text-xs subtle">
            {formatDistance(distanceKm)} · {hoursLabel(pharmacy.hours, open)}
          </span>
        </span>
        <span className="pharmacy-mini__chev" aria-hidden="true">›</span>
      </Link>
    );
  }

  return (
    <article className="pharmacy-row">
      <PharmacyLogo pharmacy={pharmacy} size={56} />
      <div className="pharmacy-row__body">
        <h3 className="pharmacy-row__name">
          <Link to={`/pharmacies/${pharmacy.id}`}>{pharmacy.name}</Link>
        </h3>
        <p className="text-sm muted">
          {pharmacy.area}, {pharmacy.city} {pharmacy.pin} · {formatDistance(distanceKm)} · {hoursLabel(pharmacy.hours, open)}
        </p>
        <div className="cluster pill-row">
          <span className={`soft-pill ${delivery.available ? 'soft-pill--green' : 'soft-pill--grey'}`}>
            {delivery.available ? <CircleCheck size={13} aria-hidden="true" /> : <CircleX size={13} aria-hidden="true" />}
            {delivery.available ? 'Delivery Available' : 'Pickup only'}
          </span>
          <span className={`soft-pill ${inStockCount ? 'soft-pill--green' : 'soft-pill--grey'}`}>
            <PackageCheck size={13} aria-hidden="true" />
            {inStockCount}/{totalListed} In Stock
          </span>
          {delivery.available && (
            <span className="soft-pill soft-pill--blue">
              <Bike size={13} aria-hidden="true" />
              {delivery.etaMin}–{delivery.etaMax} min · {formatCurrency(delivery.fee)}
            </span>
          )}
          <span className="soft-pill soft-pill--grey">{formatHours(pharmacy.hours)}</span>
        </div>
      </div>
      <div className="pharmacy-row__actions">
        <Button to={`/pharmacies/${pharmacy.id}`} size="sm" variant="outline">
          View Details
        </Button>
        <Button to={`/medicines?pharmacy=${pharmacy.id}`} size="sm" variant="primary">
          Shop
        </Button>
      </div>
    </article>
  );
}
