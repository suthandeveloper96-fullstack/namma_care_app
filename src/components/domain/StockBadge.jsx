import Badge from '../ui/Badge';
import { STOCK_LABELS, stockLevel } from '../../utils/inventory';

export default function StockBadge({ listing, showCount = false }) {
  const level = stockLevel(listing);
  const { label, tone } = STOCK_LABELS[level];
  const text = !listing?.listed ? 'Unavailable' : showCount && level !== 'out' ? `${label} · ${listing.stock}` : label;
  return <Badge tone={tone}>{text}</Badge>;
}

export function RxBadge() {
  return (
    <span className="badge badge--rx" title="Requires a valid prescription reviewed by a licensed pharmacist">
      Rx · Prescription required
    </span>
  );
}
