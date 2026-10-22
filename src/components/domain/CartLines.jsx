import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Trash2 } from 'lucide-react';
import QuantityStepper from '../ui/QuantityStepper';
import { ProductArt } from '../brand/Illustrations';
import { RxBadge } from './StockBadge';
import { itemRemoved } from '../../features/cart/cartSlice';
import { setCartQuantity } from '../../features/cart/cartThunks';
import { useToast } from '../../hooks/useToast';
import { formatCurrency } from '../../utils/format';
import { maxOrderable } from '../../utils/inventory';

/** Editable cart lines (quantity stepper + remove), used by the cart and checkout pages. */
export default function CartLines({ lines, pharmacyId }) {
  const dispatch = useDispatch();
  const toast = useToast();

  const changeQty = (medicineId, qty) => {
    const result = dispatch(setCartQuantity({ medicineId, qty }));
    if (!result.ok) toast('Quantity not updated', { tone: 'warning', message: result.error });
  };

  return (
    <ul className="cart-lines">
      {lines.map((line) => (
        <li key={line.medicineId} className="cart-line">
          <span className="cart-line__art" aria-hidden="true">
            {line.medicine && <ProductArt medicine={line.medicine} size={40} />}
          </span>
          <div className="cart-line__info">
            <Link to={`/medicines/${pharmacyId}/${line.medicineId}`} className="fw-600">
              {line.medicine?.name ?? 'Unavailable product'}
            </Link>
            <p className="text-xs subtle">
              {line.medicine?.packSize} · {formatCurrency(line.listing?.price ?? 0)} each
            </p>
            {line.medicine?.rxRequired && <RxBadge />}
            {line.error && (
              <p className="field__error" role="alert">
                {line.error}
              </p>
            )}
          </div>
          <QuantityStepper
            value={line.qty}
            min={1}
            max={Math.max(line.qty, maxOrderable(line.listing))}
            onChange={(qty) => changeQty(line.medicineId, qty)}
            label={line.medicine?.name ?? 'item'}
          />
          <span className="price cart-line__total">{formatCurrency(line.lineTotal)}</span>
          <button
            type="button"
            className="icon-btn icon-btn--plain"
            onClick={() => dispatch(itemRemoved(line.medicineId))}
            aria-label={`Remove ${line.medicine?.name ?? 'item'} from cart`}
          >
            <Trash2 aria-hidden="true" />
          </button>
        </li>
      ))}
    </ul>
  );
}
