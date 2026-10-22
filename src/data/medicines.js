// Sample catalogue for a demo pharmacy. Descriptions are deliberately neutral: the app makes
// no medical claims and never recommends products based on symptoms.
export const MEDICINE_CATEGORIES = [
  { id: 'prescription', name: 'Prescription medicines', short: 'Prescription', icon: 'FileCheck2' },
  { id: 'otc', name: 'Over-the-counter essentials', short: 'OTC essentials', icon: 'Pill' },
  { id: 'first-aid', name: 'First-aid supplies', short: 'First aid', icon: 'BriefcaseMedical' },
  { id: 'thermometers', name: 'Thermometers & monitors', short: 'Thermometers', icon: 'Thermometer' },
  { id: 'dressings', name: 'Bandages & dressings', short: 'Dressings', icon: 'Bandage' },
  { id: 'ors', name: 'Oral rehydration', short: 'ORS', icon: 'GlassWater' },
  { id: 'personal-care', name: 'Personal healthcare', short: 'Personal care', icon: 'HandHeart' },
];

const RX_NOTE =
  'Prescription-only item. It can be supplied only against a valid prescription reviewed by a licensed pharmacist.';
const LABEL_NOTE = 'Read the label carefully. Ask a doctor or pharmacist if you are unsure whether it is suitable for you.';

export const MEDICINES = [
  { id: 'med-amoxicillin-500', name: 'Amoxicillin 500 mg Capsules', categoryId: 'prescription', label: 'Generic', packSize: 'Strip of 10 capsules', mrp: 98, rxRequired: true, description: RX_NOTE, storage: 'Store below 25°C in a dry place.' },
  { id: 'med-azithromycin-500', name: 'Azithromycin 500 mg Tablets', categoryId: 'prescription', label: 'Generic', packSize: 'Strip of 3 tablets', mrp: 72, rxRequired: true, description: RX_NOTE, storage: 'Store below 30°C.' },
  { id: 'med-metformin-500', name: 'Metformin 500 mg Tablets', categoryId: 'prescription', label: 'Generic', packSize: 'Strip of 15 tablets', mrp: 36, rxRequired: true, description: RX_NOTE, storage: 'Store below 30°C, away from moisture.' },
  { id: 'med-amlodipine-5', name: 'Amlodipine 5 mg Tablets', categoryId: 'prescription', label: 'Generic', packSize: 'Strip of 15 tablets', mrp: 42, rxRequired: true, description: RX_NOTE, storage: 'Store below 30°C.' },
  { id: 'med-atorvastatin-10', name: 'Atorvastatin 10 mg Tablets', categoryId: 'prescription', label: 'Generic', packSize: 'Strip of 15 tablets', mrp: 88, rxRequired: true, description: RX_NOTE, storage: 'Store below 25°C.' },
  { id: 'med-levothyroxine-50', name: 'Levothyroxine 50 mcg Tablets', categoryId: 'prescription', label: 'Generic', packSize: 'Bottle of 100 tablets', mrp: 155, rxRequired: true, description: RX_NOTE, storage: 'Store below 25°C, protect from light.' },

  { id: 'med-paracetamol-500', name: 'Paracetamol 500 mg Tablets', categoryId: 'otc', label: 'Generic', packSize: 'Strip of 15 tablets', mrp: 24, rxRequired: false, description: `Common over-the-counter tablet. ${LABEL_NOTE}`, storage: 'Store below 30°C.' },
  { id: 'med-cetirizine-10', name: 'Cetirizine 10 mg Tablets', categoryId: 'otc', label: 'Generic', packSize: 'Strip of 10 tablets', mrp: 22, rxRequired: false, description: `Common over-the-counter tablet. ${LABEL_NOTE}`, storage: 'Store below 30°C.' },

  { id: 'med-antiseptic-liquid', name: 'Antiseptic Liquid', categoryId: 'first-aid', label: 'Store brand', packSize: '100 ml bottle', mrp: 68, rxRequired: false, description: `Household antiseptic for first-aid kits. ${LABEL_NOTE}`, storage: 'Keep tightly closed, away from children.' },
  { id: 'med-povidone-ointment', name: 'Povidone-Iodine Ointment 5%', categoryId: 'first-aid', label: 'Generic', packSize: '15 g tube', mrp: 62, rxRequired: false, description: `Topical ointment commonly kept in first-aid kits. ${LABEL_NOTE}`, storage: 'Store below 30°C.' },
  { id: 'med-first-aid-kit', name: 'Home First-Aid Kit', categoryId: 'first-aid', label: 'Store brand', packSize: '1 kit, 28 pieces', mrp: 399, rxRequired: false, description: 'Compact kit with bandages, gauze, tape, scissors and gloves. Contents may vary in this demo listing.', storage: 'Keep in a cool, dry place.' },
  { id: 'med-cotton-roll', name: 'Absorbent Cotton Roll', categoryId: 'first-aid', label: 'Store brand', packSize: '100 g roll', mrp: 55, rxRequired: false, description: 'Absorbent cotton for general first-aid use.', storage: 'Keep sealed and dry.' },

  { id: 'med-digital-thermometer', name: 'Digital Thermometer', categoryId: 'thermometers', label: 'Device', packSize: '1 unit', mrp: 249, rxRequired: false, description: 'Oral/underarm digital thermometer with a beep alert. Follow the manufacturer instructions for use and cleaning.', storage: 'Store in its case at room temperature.' },
  { id: 'med-infrared-thermometer', name: 'Infrared Forehead Thermometer', categoryId: 'thermometers', label: 'Device', packSize: '1 unit', mrp: 1499, rxRequired: false, description: 'Non-contact forehead thermometer. Follow the manufacturer instructions for accurate readings.', storage: 'Store at room temperature, away from direct sunlight.' },
  { id: 'med-pulse-oximeter', name: 'Fingertip Pulse Oximeter', categoryId: 'thermometers', label: 'Device', packSize: '1 unit', mrp: 1199, rxRequired: false, description: 'Fingertip device that displays SpO₂ and pulse readings. Not a substitute for clinical assessment.', storage: 'Store at room temperature.' },

  { id: 'med-adhesive-bandages', name: 'Adhesive Bandage Strips', categoryId: 'dressings', label: 'Store brand', packSize: 'Pack of 20', mrp: 45, rxRequired: false, description: 'Assorted adhesive strips for minor cuts.', storage: 'Keep dry.' },
  { id: 'med-crepe-bandage', name: 'Crepe Bandage 10 cm', categoryId: 'dressings', label: 'Store brand', packSize: '1 roll, 4 m stretched', mrp: 135, rxRequired: false, description: 'Elastic crepe bandage. Ask a clinician about correct application.', storage: 'Keep dry.' },
  { id: 'med-gauze-pads', name: 'Sterile Gauze Pads 10 × 10 cm', categoryId: 'dressings', label: 'Store brand', packSize: 'Pack of 10', mrp: 90, rxRequired: false, description: 'Individually wrapped sterile gauze pads.', storage: 'Do not use if the wrapper is damaged.' },
  { id: 'med-surgical-tape', name: 'Paper Surgical Tape 1 inch', categoryId: 'dressings', label: 'Store brand', packSize: '1 roll, 9 m', mrp: 70, rxRequired: false, description: 'Breathable paper tape for securing dressings.', storage: 'Keep dry.' },

  { id: 'med-ors-sachet', name: 'ORS Powder (WHO formula)', categoryId: 'ors', label: 'Generic', packSize: 'Pack of 5 sachets, 21.8 g each', mrp: 105, rxRequired: false, description: `Oral rehydration salts. Prepare exactly as directed on the pack. ${LABEL_NOTE}`, storage: 'Store below 30°C in a dry place.' },
  { id: 'med-ors-ready', name: 'Ready-to-Drink ORS', categoryId: 'ors', label: 'Store brand', packSize: '200 ml tetra pack', mrp: 38, rxRequired: false, description: `Ready-to-drink electrolyte solution. ${LABEL_NOTE}`, storage: 'Refrigerate after opening; consume within 24 hours.' },

  { id: 'med-hand-sanitiser', name: 'Hand Sanitiser 70% Alcohol', categoryId: 'personal-care', label: 'Store brand', packSize: '500 ml pump bottle', mrp: 210, rxRequired: false, description: 'Alcohol-based hand rub. Flammable — keep away from flames.', storage: 'Store below 30°C.' },
  { id: 'med-face-masks', name: '3-Ply Surgical Face Masks', categoryId: 'personal-care', label: 'Store brand', packSize: 'Box of 50', mrp: 175, rxRequired: false, description: 'Disposable 3-ply masks with ear loops.', storage: 'Keep sealed and dry.' },
  { id: 'med-nitrile-gloves', name: 'Nitrile Examination Gloves (M)', categoryId: 'personal-care', label: 'Store brand', packSize: 'Box of 20', mrp: 160, rxRequired: false, description: 'Powder-free disposable gloves, medium size.', storage: 'Store away from direct sunlight.' },
  { id: 'med-hot-water-bag', name: 'Rubber Hot Water Bag', categoryId: 'personal-care', label: 'Store brand', packSize: '1 unit, 2 L', mrp: 299, rxRequired: false, description: 'Reusable hot water bag with fabric cover. Do not fill with boiling water.', storage: 'Store empty and dry.' },
];

const MEDICINE_INDEX = new Map(MEDICINES.map((m) => [m.id, m]));

export function getMedicineById(id) {
  return MEDICINE_INDEX.get(id) ?? null;
}

export function getCategoryById(id) {
  return MEDICINE_CATEGORIES.find((c) => c.id === id) ?? null;
}
