// Thin, failure-tolerant wrapper around localStorage. Every value is stored in an envelope
// with a schema version so outdated or malformed data can be discarded safely.

export const STORAGE_PREFIX = 'nammacare';
export const STORAGE_VERSION = 1;

export const storageKey = (name) => `${STORAGE_PREFIX}:v${STORAGE_VERSION}:${name}`;

const KEY_PATTERN = new RegExp(`^${STORAGE_PREFIX}:v(\\d+):(.+)$`);

function getStorage() {
  try {
    return typeof window !== 'undefined' ? window.localStorage : null;
  } catch {
    // Access can throw in privacy modes or sandboxed iframes.
    return null;
  }
}

/** Parses a raw envelope string; returns undefined for anything unusable. */
export function parseEnvelope(raw) {
  if (typeof raw !== 'string') return undefined;
  try {
    const envelope = JSON.parse(raw);
    if (!envelope || envelope.v !== STORAGE_VERSION || !('data' in envelope)) return undefined;
    return envelope.data;
  } catch {
    return undefined;
  }
}

export function readStored(name) {
  const storage = getStorage();
  if (!storage) return undefined;
  try {
    return parseEnvelope(storage.getItem(storageKey(name)));
  } catch {
    return undefined;
  }
}

let warnedAboutWrite = false;

export function writeStored(name, data) {
  const storage = getStorage();
  if (!storage) return false;
  try {
    storage.setItem(storageKey(name), JSON.stringify({ v: STORAGE_VERSION, savedAt: new Date().toISOString(), data }));
    return true;
  } catch (error) {
    if (!warnedAboutWrite) {
      warnedAboutWrite = true;
      console.warn('[NammaCare] Could not save demo data to localStorage.', error);
    }
    return false;
  }
}

/** Removes every NammaCare key, including ones from older schema versions. */
export function clearAllStored() {
  const storage = getStorage();
  if (!storage) return;
  try {
    Object.keys(storage)
      .filter((key) => key.startsWith(`${STORAGE_PREFIX}:`))
      .forEach((key) => storage.removeItem(key));
  } catch {
    /* ignore */
  }
}

/** Returns the slice name for a current-version key, or null. */
export function sliceNameFromKey(key) {
  const match = typeof key === 'string' ? KEY_PATTERN.exec(key) : null;
  return match && Number(match[1]) === STORAGE_VERSION ? match[2] : null;
}

export const isPlainObject = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);
export const isNonEmptyString = (value) => typeof value === 'string' && value.trim().length > 0;
export const isIsoDate = (value) => typeof value === 'string' && !Number.isNaN(Date.parse(value));
