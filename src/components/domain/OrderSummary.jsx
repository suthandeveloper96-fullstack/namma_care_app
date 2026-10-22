import { formatCurrency } from '../../utils/format';

export const CHECKOUT_STEPS = ['Cart', 'Address', 'Payment', 'Confirm'];

export default function OrderSummary({ totals, pharmacy, children }) {
  return (
    <div className="stack">
      <dl className="summary-list">
        <div>
          <dt>Subtotal</dt>
          <dd>{formatCurrency(totals.subtotal)}</dd>
        </div>
        <div>
          <dt>Delivery fee (simulated)</dt>
          <dd>{totals.deliveryFee ? formatCurrency(totals.deliveryFee) : 'Free'}</dd>
        </div>
        <div className="summary-list__total">
          <dt>Total</dt>
          <dd>{formatCurrency(totals.total)}</dd>
        </div>
      </dl>
      {totals.freeDeliveryGap > 0 && pharmacy?.delivery.available && (
        <p className="text-xs muted">
          Add {formatCurrency(totals.freeDeliveryGap)} more for free demo delivery from {pharmacy.name}.
        </p>
      )}
      {children}
    </div>
  );
}
