export function initials(name) {
  return name
    .replace(/^Dr\.?\s+/i, '')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('');
}

/** Shows only the last 4 digits, e.g. "••••••0001". */
export function maskPhone(phone) {
  const digits = String(phone ?? '');
  return digits.length > 4 ? `${'•'.repeat(digits.length - 4)}${digits.slice(-4)}` : digits;
}
