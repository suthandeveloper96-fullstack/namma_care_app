// Reference points used to simulate "nearby" distances. Coordinates are approximate
// neighbourhood centres; no live geolocation is used.
export const LOCATIONS = [
  { id: 'chn-tnagar', area: 'T. Nagar', city: 'Chennai', pin: '600017', lat: 13.0418, lng: 80.2341 },
  { id: 'chn-adyar', area: 'Adyar', city: 'Chennai', pin: '600020', lat: 13.0012, lng: 80.2565 },
  { id: 'chn-annanagar', area: 'Anna Nagar', city: 'Chennai', pin: '600040', lat: 13.085, lng: 80.2101 },
  { id: 'chn-velachery', area: 'Velachery', city: 'Chennai', pin: '600042', lat: 12.9815, lng: 80.218 },
  { id: 'cbe-rspuram', area: 'R.S. Puram', city: 'Coimbatore', pin: '641002', lat: 11.0089, lng: 76.9506 },
  { id: 'mdu-kknagar', area: 'K.K. Nagar', city: 'Madurai', pin: '625020', lat: 9.9312, lng: 78.143 },
  { id: 'try-thillainagar', area: 'Thillai Nagar', city: 'Tiruchirappalli', pin: '620018', lat: 10.827, lng: 78.683 },
];

export const DEFAULT_LOCATION_ID = 'chn-tnagar';

// Rough PIN prefix → city mapping so a typed PIN can resolve to the closest demo reference point.
const PIN_PREFIX_TO_LOCATION = {
  600: 'chn-tnagar',
  601: 'chn-velachery',
  602: 'chn-annanagar',
  603: 'chn-velachery',
  641: 'cbe-rspuram',
  642: 'cbe-rspuram',
  625: 'mdu-kknagar',
  620: 'try-thillainagar',
  621: 'try-thillainagar',
};

export function getLocationById(id) {
  return LOCATIONS.find((l) => l.id === id) ?? null;
}

export function findLocationByPin(pin) {
  const exact = LOCATIONS.find((l) => l.pin === pin);
  if (exact) return exact;
  const prefixMatch = PIN_PREFIX_TO_LOCATION[String(pin).slice(0, 3)];
  return prefixMatch ? getLocationById(prefixMatch) : null;
}
