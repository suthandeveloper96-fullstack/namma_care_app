import { LISTING_INDEX, getPharmacyById } from '../data/pharmacies';
import { getMedicineById } from '../data/medicines';

export const MAX_QTY_PER_ITEM = 10;
export const LOW_STOCK_THRESHOLD = 5;

export const listingKey = (pharmacyId, medicineId) => `${pharmacyId}:${medicineId}`;

/** Merges static listing data (price) with live demo inventory (stock, listed). */
export function resolveListing(inventory, pharmacyId, medicineId) {
  const key = listingKey(pharmacyId, medicineId);
  const base = LISTING_INDEX.get(key);
  const medicine = getMedicineById(medicineId);
  const pharmacy = getPharmacyById(pharmacyId);
  if (!base || !medicine || !pharmacy) return null;
  const live = inventory?.byKey?.[key];
  return {
    key,
    pharmacyId,
    medicineId,
    price: base.price,
    stock: live?.stock ?? base.initialStock,
    listed: live?.listed ?? true,
    medicine,
    pharmacy,
  };
}

export function stockLevel(listing) {
  if (!listing || !listing.listed || listing.stock <= 0) return 'out';
  if (listing.stock <= LOW_STOCK_THRESHOLD) return 'low';
  return 'in';
}

export const STOCK_LABELS = {
  in: { label: 'In stock', tone: 'success' },
  low: { label: 'Low stock', tone: 'warning' },
  out: { label: 'Out of stock', tone: 'neutral' },
};

export function maxOrderable(listing) {
  if (!listing || !listing.listed) return 0;
  return Math.max(0, Math.min(listing.stock, MAX_QTY_PER_ITEM));
}

export function validateQuantity(listing, qty) {
  if (!listing) return 'This product is no longer listed.';
  if (!listing.listed || listing.stock <= 0) return 'Currently out of stock at this pharmacy.';
  if (!Number.isInteger(qty) || qty < 1) return 'Quantity must be at least 1.';
  if (qty > listing.stock) return `Only ${listing.stock} left in stock.`;
  if (qty > MAX_QTY_PER_ITEM) return `Maximum ${MAX_QTY_PER_ITEM} units per item for demo orders.`;
  return '';
}

/** Resolves cart lines against current inventory and attaches any validation error. */
export function resolveCartLines(cart, inventory) {
  return cart.items.map((item) => {
    const listing = cart.pharmacyId ? resolveListing(inventory, cart.pharmacyId, item.medicineId) : null;
    return {
      ...item,
      listing,
      medicine: getMedicineById(item.medicineId),
      lineTotal: listing ? listing.price * item.qty : 0,
      error: validateQuantity(listing, item.qty),
    };
  });
}

/** Simulated delivery speeds. Express always charges its flat fee. */
export const DELIVERY_OPTIONS = {
  standard: { label: 'Standard delivery', detail: (d) => `${d.etaMin}–${d.etaMax} min (simulated)` },
  express: { label: 'Express delivery', detail: () => 'Within 25 min (simulated)', fee: 60 },
};

export function computeTotals(lines, pharmacy, option = 'standard') {
  const subtotal = lines.reduce((sum, line) => sum + line.lineTotal, 0);
  const delivery = pharmacy?.delivery;
  const qualifiesForFree = delivery && subtotal >= delivery.freeAbove;
  let deliveryFee = !delivery?.available || subtotal === 0 || qualifiesForFree ? 0 : delivery.fee;
  if (option === 'express' && delivery?.available && subtotal > 0) deliveryFee = DELIVERY_OPTIONS.express.fee;
  return {
    subtotal,
    deliveryFee,
    total: subtotal + deliveryFee,
    freeDeliveryGap: delivery?.available && !qualifiesForFree ? Math.max(0, delivery.freeAbove - subtotal) : 0,
  };
}
