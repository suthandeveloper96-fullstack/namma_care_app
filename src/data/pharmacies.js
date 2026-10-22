import { getMedicineById } from './medicines';

// FICTIONAL demo pharmacies. They are not real businesses and do not dispense or deliver anything.
// `stock` maps medicine id → starting units; a medicine absent from the map is not stocked there.
export const PHARMACIES = [
  {
    id: 'phm-thendral-meds',
    name: 'Thendral Medicals',
    address: '18 Usman Road, T. Nagar',
    area: 'T. Nagar',
    city: 'Chennai',
    pin: '600017',
    lat: 13.0396,
    lng: 80.2364,
    hours: { open: '08:00', close: '22:30' },
    delivery: { available: true, etaMin: 30, etaMax: 45, fee: 35, freeAbove: 499 },
    discountPct: 10,
    stock: {
      'med-amoxicillin-500': 40, 'med-azithromycin-500': 25, 'med-metformin-500': 80, 'med-amlodipine-5': 60,
      'med-atorvastatin-10': 0, 'med-paracetamol-500': 150, 'med-cetirizine-10': 90, 'med-antiseptic-liquid': 30,
      'med-povidone-ointment': 22, 'med-first-aid-kit': 6, 'med-digital-thermometer': 14, 'med-pulse-oximeter': 4,
      'med-adhesive-bandages': 70, 'med-crepe-bandage': 18, 'med-gauze-pads': 35, 'med-ors-sachet': 50,
      'med-ors-ready': 40, 'med-hand-sanitiser': 25, 'med-face-masks': 30,
    },
  },
  {
    id: 'phm-adyar-24',
    name: 'Adyar 24 Hour Pharmacy',
    address: '56 L.B. Road, Adyar',
    area: 'Adyar',
    city: 'Chennai',
    pin: '600020',
    lat: 13.0034,
    lng: 80.2551,
    hours: { open24h: true },
    delivery: { available: true, etaMin: 25, etaMax: 40, fee: 40, freeAbove: 599 },
    discountPct: 5,
    stock: {
      'med-amoxicillin-500': 18, 'med-azithromycin-500': 12, 'med-metformin-500': 45, 'med-amlodipine-5': 30,
      'med-atorvastatin-10': 26, 'med-levothyroxine-50': 9, 'med-paracetamol-500': 200, 'med-cetirizine-10': 60,
      'med-antiseptic-liquid': 20, 'med-first-aid-kit': 3, 'med-cotton-roll': 40, 'med-digital-thermometer': 10,
      'med-infrared-thermometer': 2, 'med-adhesive-bandages': 55, 'med-gauze-pads': 20, 'med-surgical-tape': 25,
      'med-ors-sachet': 35, 'med-ors-ready': 0, 'med-nitrile-gloves': 12, 'med-hot-water-bag': 5,
    },
  },
  {
    id: 'phm-annanagar-care',
    name: 'Anna Nagar Care Pharmacy',
    address: '2nd Avenue, Shanthi Colony, Anna Nagar',
    area: 'Anna Nagar',
    city: 'Chennai',
    pin: '600040',
    lat: 13.0862,
    lng: 80.2125,
    hours: { open: '07:30', close: '23:00' },
    delivery: { available: true, etaMin: 40, etaMax: 60, fee: 30, freeAbove: 399 },
    discountPct: 12,
    stock: {
      'med-metformin-500': 120, 'med-amlodipine-5': 70, 'med-atorvastatin-10': 55, 'med-levothyroxine-50': 14,
      'med-paracetamol-500': 110, 'med-cetirizine-10': 40, 'med-povidone-ointment': 18, 'med-first-aid-kit': 8,
      'med-digital-thermometer': 20, 'med-infrared-thermometer': 6, 'med-pulse-oximeter': 7, 'med-crepe-bandage': 10,
      'med-gauze-pads': 30, 'med-ors-sachet': 60, 'med-ors-ready': 24, 'med-hand-sanitiser': 18,
      'med-face-masks': 40, 'med-nitrile-gloves': 15,
    },
  },
  {
    id: 'phm-velachery-plus',
    name: 'Velachery Health Plus',
    address: '201 Taramani Link Road, Velachery',
    area: 'Velachery',
    city: 'Chennai',
    pin: '600042',
    lat: 12.9801,
    lng: 80.2203,
    hours: { open: '09:00', close: '21:00' },
    // Pickup-only demo pharmacy to show how the UI handles unavailable delivery.
    delivery: { available: false, etaMin: 0, etaMax: 0, fee: 0, freeAbove: 0 },
    discountPct: 8,
    stock: {
      'med-amoxicillin-500': 15, 'med-paracetamol-500': 90, 'med-cetirizine-10': 35, 'med-antiseptic-liquid': 14,
      'med-cotton-roll': 25, 'med-adhesive-bandages': 40, 'med-crepe-bandage': 12, 'med-surgical-tape': 16,
      'med-ors-sachet': 30, 'med-hand-sanitiser': 10, 'med-face-masks': 22,
    },
  },
  {
    id: 'phm-kovai-wellness',
    name: 'Kovai Wellness Pharmacy',
    address: '11 Oppanakara Street, Town Hall',
    area: 'Town Hall',
    city: 'Coimbatore',
    pin: '641001',
    lat: 10.9946,
    lng: 76.9618,
    hours: { open: '08:00', close: '22:00' },
    delivery: { available: true, etaMin: 35, etaMax: 55, fee: 35, freeAbove: 499 },
    discountPct: 10,
    stock: {
      'med-amoxicillin-500': 22, 'med-azithromycin-500': 10, 'med-metformin-500': 75, 'med-amlodipine-5': 35,
      'med-paracetamol-500': 130, 'med-first-aid-kit': 5, 'med-digital-thermometer': 9, 'med-adhesive-bandages': 45,
      'med-gauze-pads': 18, 'med-ors-sachet': 40, 'med-ors-ready': 30, 'med-face-masks': 25, 'med-hot-water-bag': 4,
    },
  },
  {
    id: 'phm-vaigai-meds',
    name: 'Vaigai Medicals',
    address: '33 North Masi Street',
    area: 'Masi Street',
    city: 'Madurai',
    pin: '625001',
    lat: 9.9215,
    lng: 78.1195,
    hours: { open: '08:30', close: '22:00' },
    delivery: { available: true, etaMin: 45, etaMax: 70, fee: 30, freeAbove: 399 },
    discountPct: 15,
    stock: {
      'med-metformin-500': 60, 'med-amlodipine-5': 40, 'med-atorvastatin-10': 20, 'med-paracetamol-500': 100,
      'med-cetirizine-10': 50, 'med-antiseptic-liquid': 16, 'med-digital-thermometer': 8, 'med-crepe-bandage': 9,
      'med-ors-sachet': 45, 'med-hand-sanitiser': 12, 'med-nitrile-gloves': 10,
    },
  },
];

const PHARMACY_INDEX = new Map(PHARMACIES.map((p) => [p.id, p]));

export function getPharmacyById(id) {
  return PHARMACY_INDEX.get(id) ?? null;
}

export function priceFor(pharmacy, medicine) {
  return Math.round(medicine.mrp * (1 - pharmacy.discountPct / 100));
}

/** Static listings (pharmacy × medicine) used to seed the inventory slice. */
export const STATIC_LISTINGS = PHARMACIES.flatMap((pharmacy) =>
  Object.entries(pharmacy.stock)
    .filter(([medicineId]) => getMedicineById(medicineId))
    .map(([medicineId, stock]) => ({
      pharmacyId: pharmacy.id,
      medicineId,
      price: priceFor(pharmacy, getMedicineById(medicineId)),
      initialStock: stock,
    })),
);

export const LISTING_INDEX = new Map(STATIC_LISTINGS.map((l) => [`${l.pharmacyId}:${l.medicineId}`, l]));

export function pharmaciesStocking(medicineId) {
  return STATIC_LISTINGS.filter((l) => l.medicineId === medicineId).map((l) => l.pharmacyId);
}

