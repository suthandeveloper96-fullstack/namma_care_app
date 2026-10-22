// Crockford-style alphabet: no 0/O or 1/I to keep references easy to read aloud.
const ALPHABET = '23456789ABCDEFGHJKMNPQRSTUVWXYZ';

function randomChars(length) {
  const values = new Uint32Array(length);
  if (globalThis.crypto?.getRandomValues) {
    globalThis.crypto.getRandomValues(values);
  } else {
    for (let i = 0; i < length; i += 1) values[i] = Math.floor(Math.random() * 2 ** 32);
  }
  return Array.from(values, (v) => ALPHABET[v % ALPHABET.length]).join('');
}

export function generateId(prefix) {
  const uuid = globalThis.crypto?.randomUUID?.() ?? `${Date.now().toString(36)}${randomChars(8)}`;
  return `${prefix}-${uuid}`;
}

/** e.g. "NC-APT-261021-7KQX" — DEMO reference, not issued by any facility. */
export function generateReference(kind, date = new Date()) {
  const yy = String(date.getFullYear()).slice(2);
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `NC-${kind}-${yy}${mm}${dd}-${randomChars(4)}`;
}
