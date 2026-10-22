import { Link } from 'react-router-dom';
import { Package, Store } from 'lucide-react';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import { getPharmacyById } from '../../data/pharmacies';
import { ORDER_STATUS } from '../../utils/orderStatus';
import { formatCurrency, formatDateTime, pluralize } from '../../utils/format';

export default function OrderCard({ order }) {
  const pharmacy = getPharmacyById(order.pharmacyId);
  const status = ORDER_STATUS[order.status];
  const itemCount = order.items.reduce((sum, i) => sum + i.qty, 0);
  return (
    <article className="card card--pad order-card">
      <div className="cluster cluster--between">
        <div className="cluster">
          <div className="icon-tile icon-tile--sm" aria-hidden="true">
            <Package />
          </div>
          <div>
            <h3 className="card-title" style={{ fontSize: 'var(--fs-md)' }}>
              <Link to={`/orders/${order.id}`}>Order {order.ref}</Link>
            </h3>
            <p className="text-xs subtle">Placed {formatDateTime(order.createdAt)}</p>
          </div>
        </div>
        <Badge tone={status.tone}>{status.label}</Badge>
      </div>
      <p className="text-sm muted order-card__items">
        {order.items.map((i) => `${i.name} × ${i.qty}`).join(', ')}
      </p>
      <div className="cluster cluster--between">
        <span className="meta-row">
          <span>
            <Store aria-hidden="true" />
            {pharmacy?.name}
          </span>
          <span>
            {pluralize(itemCount, 'item')} · <strong className="price">{formatCurrency(order.total)}</strong>
          </span>
        </span>
        <Button size="sm" variant="secondary" to={`/orders/${order.id}`}>
          Track order
        </Button>
      </div>
    </article>
  );
}
