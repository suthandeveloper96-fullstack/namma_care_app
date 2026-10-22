import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ShoppingBag } from 'lucide-react';
import { selectCart, selectCartCount } from '../../features/cart/cartSlice';
import { selectInventory } from '../../features/inventory/inventorySlice';
import { formatCurrency } from '../../utils/format';
import { resolveCartLines } from '../../utils/inventory';

/** Sticky summary bar shown on shopping pages while the cart has items. */
export default function CartBar() {
  const cart = useSelector(selectCart);
  const count = useSelector(selectCartCount);
  const inventory = useSelector(selectInventory);
  if (!count) return null;
  const subtotal = resolveCartLines(cart, inventory).reduce((sum, l) => sum + l.lineTotal, 0);
  return (
    <div className="cart-bar" role="region" aria-label="Cart summary">
      <Link to="/cart" className="cart-bar__link">
        <ShoppingBag size={18} aria-hidden="true" />
        View Cart ({count})
        <span className="cart-bar__total">{formatCurrency(subtotal)}</span>
      </Link>
    </div>
  );
}
