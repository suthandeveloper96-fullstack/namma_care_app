// Form validators return an error message string, or '' when the value is valid.

export function normalizePhone(value) {
  const digits = String(value ?? '').replace(/\D/g, '');
  if (digits.length === 12 && digits.startsWith('91')) return digits.slice(2);
  if (digits.length === 11 && digits.startsWith('0')) return digits.slice(1);
  return digits;
}

export const PHONE_DIGITS = 10;

/**
 * Keeps only digits (max 10) so mobile inputs never contain letters, spaces or symbols.
 * A pasted "+91 98765 43210" or "098765 43210" drops the country/trunk prefix first.
 */
export function sanitizePhoneInput(value) {
  let digits = String(value ?? '').replace(/\D/g, '');
  if (digits.length > PHONE_DIGITS && digits.startsWith('91')) digits = digits.slice(2);
  else if (digits.length > PHONE_DIGITS && digits.startsWith('0')) digits = digits.slice(1);
  return digits.slice(0, PHONE_DIGITS);
}

export function validateName(value) {
  const name = String(value ?? '').trim();
  if (!name) return 'Name is required.';
  if (name.length < 2) return 'Name must be at least 2 characters.';
  if (name.length > 60) return 'Name must be 60 characters or fewer.';
  if (!/^[\p{L} .'-]+$/u.test(name)) return 'Use letters, spaces, dots or hyphens only.';
  return '';
}

export function validateAge(value) {
  const raw = String(value ?? '').trim();
  if (!raw) return 'Age is required.';
  if (!/^\d{1,3}$/.test(raw)) return 'Enter age in whole years.';
  const age = Number(raw);
  if (age < 0 || age > 120) return 'Enter an age between 0 and 120.';
  return '';
}

/** Indian mobile numbers: 10 digits starting 6–9, optional +91 / 0 prefix. */
export function validatePhone(value) {
  if (!String(value ?? '').trim()) return 'Phone number is required.';
  const phone = normalizePhone(value);
  if (!/^[6-9]\d{9}$/.test(phone)) return 'Enter a valid 10-digit Indian mobile number.';
  return '';
}

/** Demo delivery is limited to Tamil Nadu PIN codes (60xxxx–64xxxx). */
export function validatePin(value) {
  const pin = String(value ?? '').trim();
  if (!pin) return 'PIN code is required.';
  if (!/^\d{6}$/.test(pin)) return 'PIN code must be 6 digits.';
  if (!/^6[0-4]\d{4}$/.test(pin)) return 'Demo delivery covers Tamil Nadu PIN codes only (600000–643999).';
  return '';
}

export function validateRequired(value, label, { min = 1, max = 200 } = {}) {
  const text = String(value ?? '').trim();
  if (!text) return `${label} is required.`;
  if (text.length < min) return `${label} must be at least ${min} characters.`;
  if (text.length > max) return `${label} must be ${max} characters or fewer.`;
  return '';
}

export function validateOptional(value, label, { max = 200 } = {}) {
  return String(value ?? '').trim().length > max ? `${label} must be ${max} characters or fewer.` : '';
}

/** Runs a { field: validatorFn } schema; returns only fields with errors. */
export function validateFields(values, schema) {
  return Object.entries(schema).reduce((errors, [field, validate]) => {
    const message = validate(values[field], values);
    if (message) errors[field] = message;
    return errors;
  }, {});
}

export const PRESCRIPTION_FILE_RULES = {
  maxBytes: 5 * 1024 * 1024,
  types: {
    'image/jpeg': 'JPG',
    'image/png': 'PNG',
    'image/webp': 'WEBP',
    'application/pdf': 'PDF',
  },
};

export function validatePrescriptionFile(file) {
  if (!file) return 'Choose a file to upload.';
  if (!PRESCRIPTION_FILE_RULES.types[file.type]) return 'Only JPG, PNG, WEBP or PDF files are accepted.';
  if (file.size === 0) return 'The selected file is empty.';
  if (file.size > PRESCRIPTION_FILE_RULES.maxBytes) return 'File must be 5 MB or smaller.';
  return '';
}
