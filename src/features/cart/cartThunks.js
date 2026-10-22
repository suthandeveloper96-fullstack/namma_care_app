import { itemAdded, prescriptionAttached, quantityChanged } from './cartSlice';
import { prescriptionSubmitted } from '../prescriptions/prescriptionsSlice';
import { getMedicineById } from '../../data/medicines';
import { resolveListing, validateQuantity } from '../../utils/inventory';
import { generateId } from '../../utils/reference';
import { validatePrescriptionFile } from '../../utils/validation';

/**
 * Adds a product to the cart after stock checks.
 * Returns { ok } | { ok: false, error } | { ok: false, conflict: 'pharmacy', currentPharmacyId }.
 */
export const addToCart =
  ({ pharmacyId, medicineId, qty = 1, replaceCart = false }) =>
  (dispatch, getState) => {
    const { cart, inventory } = getState();
    if (cart.pharmacyId && cart.pharmacyId !== pharmacyId && cart.items.length && !replaceCart) {
      return { ok: false, conflict: 'pharmacy', currentPharmacyId: cart.pharmacyId };
    }
    const listing = resolveListing(inventory, pharmacyId, medicineId);
    const sameCart = cart.pharmacyId === pharmacyId;
    const inCart = sameCart ? cart.items.find((i) => i.medicineId === medicineId)?.qty ?? 0 : 0;
    const error = validateQuantity(listing, inCart + qty);
    if (error) return { ok: false, error };
    dispatch(itemAdded({ pharmacyId, medicineId, qty }));
    return { ok: true };
  };

export const setCartQuantity =
  ({ medicineId, qty }) =>
  (dispatch, getState) => {
    const { cart, inventory } = getState();
    if (qty > 0) {
      const error = validateQuantity(resolveListing(inventory, cart.pharmacyId, medicineId), qty);
      if (error) return { ok: false, error };
    }
    dispatch(quantityChanged({ medicineId, qty }));
    return { ok: true };
  };

/**
 * Records a prescription upload for simulated review. The File object is only validated here;
 * just its name/type/size are stored. Status always starts as "pending" — never auto-approved.
 */
export const submitPrescription =
  ({ file, patientName }) =>
  (dispatch, getState) => {
    const error = validatePrescriptionFile(file);
    if (error) return { ok: false, error };
    const { cart } = getState();
    const medicineIds = cart.items.map((i) => i.medicineId).filter((id) => getMedicineById(id)?.rxRequired);
    if (!cart.pharmacyId || !medicineIds.length) {
      return { ok: false, error: 'Your cart has no prescription-only items.' };
    }
    const prescription = {
      id: generateId('rx'),
      owner: 'me',
      pharmacyId: cart.pharmacyId,
      medicineIds,
      patientName: patientName || 'You',
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
      status: 'pending',
      submittedAt: new Date().toISOString(),
      reviewedAt: null,
      reviewNote: '',
    };
    dispatch(prescriptionSubmitted(prescription));
    dispatch(prescriptionAttached(prescription.id));
    return { ok: true, prescription };
  };
