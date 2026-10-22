import { useCallback, useState } from 'react';
import { useDispatch } from 'react-redux';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import { addToCart } from '../features/cart/cartThunks';
import { getPharmacyById } from '../data/pharmacies';
import { useToast } from './useToast';

/**
 * Wraps the addToCart thunk with toasts and a confirmation dialog for the
 * single-pharmacy cart rule. Render the returned `dialog` element once.
 */
export function useAddToCart() {
  const dispatch = useDispatch();
  const toast = useToast();
  const [pending, setPending] = useState(null);

  const add = useCallback(
    (listing, qty = 1) => {
      const request = { pharmacyId: listing.pharmacyId, medicineId: listing.medicineId, qty };
      const result = dispatch(addToCart(request));
      if (result.ok) toast('Added to cart', { message: listing.medicine.name });
      else if (result.conflict === 'pharmacy') setPending({ ...request, listing, currentPharmacyId: result.currentPharmacyId });
      else toast('Could not add to cart', { message: result.error, tone: 'danger' });
    },
    [dispatch, toast],
  );

  const confirmReplace = () => {
    const result = dispatch(addToCart({ ...pending, replaceCart: true }));
    if (result.ok) toast('Added to cart', { message: pending.listing.medicine.name });
    else toast('Could not add to cart', { message: result.error, tone: 'danger' });
    setPending(null);
  };

  const dialog = (
    <ConfirmDialog
      open={Boolean(pending)}
      title="Start a new cart?"
      confirmLabel="Replace cart"
      onCancel={() => setPending(null)}
      onConfirm={confirmReplace}
    >
      Your cart has items from <strong>{getPharmacyById(pending?.currentPharmacyId)?.name}</strong>. Demo orders are
      fulfilled by one pharmacy at a time, so adding this item from <strong>{pending?.listing.pharmacy.name}</strong> will
      clear your current cart.
    </ConfirmDialog>
  );

  return { add, dialog };
}
