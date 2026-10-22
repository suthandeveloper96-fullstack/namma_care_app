export const DOCTOR_STATUSES = {
  available: { label: 'Available', short: 'Available', description: 'Reported as seeing patients' },
  with_patient: { label: 'With Patient', short: 'With patient', description: 'Currently in a consultation' },
  delayed: { label: 'Delayed', short: 'Delayed', description: 'Running behind schedule' },
  away: { label: 'Away', short: 'Away', description: 'Stepped away from the OPD' },
  offline: { label: 'Offline / Status Unknown', short: 'Unknown', description: 'No recent update' },
};

export const STATUS_KEYS = Object.keys(DOCTOR_STATUSES);

/** Statuses a provider can set from the dashboard. */
export const SETTABLE_STATUSES = ['available', 'with_patient', 'delayed', 'away', 'offline'];

/** Any status older than this is no longer shown as current. */
export const STALE_AFTER_MINUTES = 120;

export const DELAY_OPTIONS = [10, 15, 20, 30, 45, 60, 90];

/**
 * Resolves a stored status entry into what the UI may display. Stale or missing entries
 * are downgraded to "offline" so an old report is never presented as current availability.
 */
export function resolveDoctorStatus(entry, now = Date.now()) {
  if (!entry || !STATUS_KEYS.includes(entry.status)) {
    return { key: 'offline', label: DOCTOR_STATUSES.offline.label, stale: true, updatedAt: null, delayMinutes: 0 };
  }
  const updated = Date.parse(entry.updatedAt);
  const ageMinutes = (now - updated) / 60000;
  if (!Number.isFinite(ageMinutes) || ageMinutes > STALE_AFTER_MINUTES) {
    return {
      key: 'offline',
      label: DOCTOR_STATUSES.offline.label,
      stale: true,
      updatedAt: Number.isFinite(updated) ? entry.updatedAt : null,
      reportedKey: entry.status,
      delayMinutes: 0,
    };
  }
  return {
    key: entry.status,
    label: DOCTOR_STATUSES[entry.status].label,
    stale: false,
    updatedAt: entry.updatedAt,
    delayMinutes: entry.status === 'delayed' ? entry.delayMinutes || 0 : 0,
  };
}
