import { getMedicineById } from './medicines';
import { getPharmacyById, priceFor } from './pharmacies';

// Sample orders and prescription reviews created on first run.
// owner "sample" entries exist only so the pharmacy dashboard has something to process.

function line(pharmacy, medicineId, qty) {
  const medicine = getMedicineById(medicineId);
  return { medicineId, name: medicine.name, qty, price: priceFor(pharmacy, medicine), rxRequired: medicine.rxRequired };
}

function buildOrder({ id, ref, owner, pharmacyId, lines, address, status, history, requiresPrescription = false }) {
  const pharmacy = getPharmacyById(pharmacyId);
  const items = lines.map(([medicineId, qty]) => line(pharmacy, medicineId, qty));
  const subtotal = items.reduce((sum, item) => sum + item.price * item.qty, 0);
  const deliveryFee = subtotal >= pharmacy.delivery.freeAbove ? 0 : pharmacy.delivery.fee;
  return {
    id,
    ref,
    owner,
    pharmacyId,
    items,
    subtotal,
    deliveryFee,
    total: subtotal + deliveryFee,
    address,
    requiresPrescription,
    prescriptionId: null,
    status,
    history,
    createdAt: history[0].at,
    updatedAt: history[history.length - 1].at,
  };
}

const minutesAgo = (now, m) => new Date(now.getTime() - m * 60000).toISOString();

export function createSeedOrders(now = new Date()) {
  // No pre-made orders for the user: "My Orders" only lists orders they place.
  // This sample customer order only appears in the pharmacy dashboard.
  return [
    buildOrder({
      id: 'ord-seed-incoming',
      ref: 'NC-ORD-DEMO-S1',
      owner: 'sample',
      pharmacyId: 'phm-thendral-meds',
      lines: [['med-digital-thermometer', 1], ['med-face-masks', 1]],
      address: { name: 'Janani K.', phone: '9000000102', line1: '4 Sample Lane, West Mambalam', city: 'Chennai', pin: '600033' },
      status: 'awaiting_review',
      history: [
        { status: 'submitted', at: minutesAgo(now, 12), actor: 'patient' },
        { status: 'awaiting_review', at: minutesAgo(now, 12), actor: 'system' },
      ],
    }),
  ];
}

export function createSeedPrescriptions(now = new Date()) {
  return [
    {
      id: 'rx-seed-sample',
      owner: 'sample',
      pharmacyId: 'phm-thendral-meds',
      medicineIds: ['med-amlodipine-5'],
      patientName: 'Murugan S.',
      fileName: 'sample-prescription.jpg',
      fileType: 'image/jpeg',
      fileSize: 284000,
      status: 'pending',
      submittedAt: minutesAgo(now, 18),
      reviewedAt: null,
      reviewNote: '',
    },
  ];
}
