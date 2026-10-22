// UI strings live here so a Tamil (`ta`) dictionary can be added later without touching
// components. Only English ships in this demo.
const en = {
  'nav.home': 'Discover',
  'nav.doctors': 'Find Doctors',
  'nav.hospitals': 'Hospitals',
  'nav.pharmacies': 'Pharmacies',
  'nav.medicines': 'Medicines',
  'nav.appointments': 'My Appointments',
  'nav.orders': 'My Orders',
  'nav.profile': 'Profile',
  'nav.cart': 'Cart',
  'nav.providerDashboard': 'Provider dashboard',
  'nav.pharmacyDashboard': 'Pharmacy dashboard',
  'demo.banner': 'Demo prototype — all hospitals, doctors, pharmacies, bookings and orders are simulated and stored only in this browser.',
  'demo.emergency': 'In an emergency, call 108 (ambulance) or 112 immediately. NammaCare is not an emergency service.',
  'hero.title': 'Know Before You Go.',
  'hero.subtitle': 'Check the latest reported doctor availability, book a slot and order pharmacy essentials — all in one place.',
  'cta.findDoctors': 'Find Available Doctors',
  'cta.orderMedicines': 'Order Medicines',
};

const dictionaries = { en };
let currentLocale = 'en';

export function setLocale(locale) {
  if (dictionaries[locale]) currentLocale = locale;
}

export function t(key) {
  return dictionaries[currentLocale][key] ?? dictionaries.en[key] ?? key;
}
