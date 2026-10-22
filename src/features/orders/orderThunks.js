import { orderAdded, orderStatusChanged } from './ordersSlice';
import { cartCleared } from '../cart/cartSlice';
import { stockAdjusted } from '../inventory/inventorySlice';
import { getPharmacyById } from '../../data/pharmacies';
import { computeTotals, resolveCartLines } from '../../utils/inventory';
import { PATIENT_CANCELLABLE, RELEASES_STOCK, canTransition } from '../../utils/orderStatus';
import { generateId, generateReference } from '../../utils/reference';
import { normalizePhone, validateFields, validateName, validatePhone, validatePin, validateRequired } from '../../utils/validation';

export const ADDRESS_SCHEMA = {
  name: validateName,
  phone: validatePhone,
  line1: (v) => validateRequired(v, 'Address', { min: 8, max: 160 }),
  city: (v) => validateRequired(v, 'City', { min: 2, max: 60 }),
  pin: validatePin,
};

/** Everything that must be true before checkout can proceed. */
export function getCheckoutBlockers({ cart, inventory, prescriptions }) {
  const blockers = [];
  const pharmacy = getPharmacyById(cart.pharmacyId);
  if (!cart.items.length || !pharmacy) {
    blockers.push('Your cart is empty.');
    return blockers;
  }
  if (!pharmacy.delivery.available) blockers.push(`${pharmacy.name} does not offer demo delivery. Choose another pharmacy.`);
  const lines = resolveCartLines(cart, inventory);
  lines.filter((l) => l.error).forEach((l) => blockers.push(`${l.medicine?.name ?? 'An item'}: ${l.error}`));
  if (lines.some((l) => l.medicine?.rxRequired)) {
    const rx = prescriptions.items.find((p) => p.id === cart.prescriptionId);
    if (!rx) blockers.push('Upload a prescription for the prescription-only items.');
    else if (rx.status === 'pending') blockers.push('Your prescription is awaiting simulated pharmacist review.');
    else if (rx.status === 'rejected') blockers.push('Your prescription was rejected in the simulated review. Upload a new one or remove those items.');
  }
  return blockers;
}

export const placeOrder = (address, deliveryOption = 'standard') => (dispatch, getState) => {
  const state = getState();
  const fieldErrors = validateFields(address, ADDRESS_SCHEMA);
  if (Object.keys(fieldErrors).length) return { ok: false, error: 'Please fix the highlighted delivery details.', fieldErrors };

  const blockers = getCheckoutBlockers(state);
  if (blockers.length) return { ok: false, error: blockers[0], fieldErrors: {} };

  const { cart, inventory } = state;
  const pharmacy = getPharmacyById(cart.pharmacyId);
  const lines = resolveCartLines(cart, inventory);
  const option = deliveryOption === 'express' ? 'express' : 'standard';
  const totals = computeTotals(lines, pharmacy, option);
  const requiresPrescription = lines.some((l) => l.medicine.rxRequired);
  const rx = requiresPrescription ? state.prescriptions.items.find((p) => p.id === cart.prescriptionId) : null;
  const now = new Date().toISOString();

  const history = [{ status: 'submitted', at: now, actor: 'patient' }];
  if (rx) history.push({ status: 'prescription_review', at: rx.reviewedAt ?? now, actor: 'pharmacy', note: 'Approved in simulated review' });
  history.push({ status: 'awaiting_review', at: now, actor: 'system' });

  const order = {
    id: generateId('ord'),
    ref: generateReference('ORD'),
    owner: 'me',
    pharmacyId: pharmacy.id,
    items: lines.map((l) => ({
      medicineId: l.medicineId,
      name: l.medicine.name,
      qty: l.qty,
      price: l.listing.price,
      rxRequired: l.medicine.rxRequired,
    })),
    subtotal: totals.subtotal,
    deliveryFee: totals.deliveryFee,
    total: totals.total,
    address: {
      name: address.name.trim(),
      phone: normalizePhone(address.phone),
      line1: address.line1.trim(),
      city: address.city.trim(),
      pin: address.pin.trim(),
    },
    deliveryOption: option,
    requiresPrescription,
    prescriptionId: rx?.id ?? null,
    status: 'awaiting_review',
    history,
    createdAt: now,
    updatedAt: now,
  };

  dispatch(orderAdded(order));
  // Reserve stock immediately; it is released again if the order is rejected or cancelled.
  order.items.forEach((item) =>
    dispatch(stockAdjusted({ pharmacyId: pharmacy.id, medicineId: item.medicineId, delta: -item.qty })),
  );
  dispatch(cartCleared());
  return { ok: true, order };
};

export const changeOrderStatus =
  ({ id, status, actor = 'pharmacy', note = '' }) =>
  (dispatch, getState) => {
    const order = getState().orders.items.find((o) => o.id === id);
    if (!order) return { ok: false, error: 'Order not found.' };
    if (actor === 'patient' && !(status === 'cancelled' && PATIENT_CANCELLABLE.includes(order.status))) {
      return { ok: false, error: 'This order can no longer be cancelled.' };
    }
    if (!canTransition(order.status, status)) return { ok: false, error: 'That status change is not allowed.' };

    dispatch(orderStatusChanged({ id, status, actor, note }));
    if (RELEASES_STOCK.includes(status)) {
      order.items.forEach((item) =>
        dispatch(stockAdjusted({ pharmacyId: order.pharmacyId, medicineId: item.medicineId, delta: item.qty })),
      );
    }
    return { ok: true };
  };
