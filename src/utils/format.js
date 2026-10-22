import { parseDateKey, toDateKey, addDays } from './date';

const LOCALE = 'en-IN';

const inrFormatter = new Intl.NumberFormat(LOCALE, {
  style: 'currency',
  currency: 'INR',
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

export function formatCurrency(amount) {
  return inrFormatter.format(Number.isFinite(amount) ? amount : 0);
}

function toDate(value) {
  if (value instanceof Date) return value;
  return parseDateKey(value) ?? new Date(value);
}

/** 21 Oct 2026 */
export function formatDate(value) {
  const date = toDate(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString(LOCALE, { day: 'numeric', month: 'short', year: 'numeric' });
}

/** Wed, 21 Oct */
export function formatDateShort(value) {
  const date = toDate(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString(LOCALE, { weekday: 'short', day: 'numeric', month: 'short' });
}

/** "Today", "Tomorrow" or "Fri, 24 Oct" */
export function formatDayLabel(dateKey, now = new Date()) {
  if (dateKey === toDateKey(now)) return 'Today';
  if (dateKey === toDateKey(addDays(now, 1))) return 'Tomorrow';
  return formatDateShort(dateKey);
}

/** "14:20" → "2:20 PM" */
export function formatTime(time) {
  if (typeof time !== 'string' || !time.includes(':')) return '—';
  const [h, m] = time.split(':').map(Number);
  const suffix = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 === 0 ? 12 : h % 12;
  return `${hour}:${String(m).padStart(2, '0')} ${suffix}`;
}

export function formatDateTime(iso) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString(LOCALE, {
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

export function formatRelative(iso, now = Date.now()) {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return 'unknown';
  const diffMin = Math.round((now - then) / 60000);
  if (diffMin < 1) return 'just now';
  if (diffMin < 60) return `${diffMin} min ago`;
  const hours = Math.round(diffMin / 60);
  if (hours < 24) return `${hours} h ago`;
  const days = Math.round(hours / 24);
  return days === 1 ? '1 day ago' : `${days} days ago`;
}

export function formatDistance(km) {
  if (!Number.isFinite(km)) return '—';
  if (km < 1) return `${Math.max(100, Math.round(km * 10) * 100)} m`;
  if (km < 20) return `${km.toFixed(1)} km`;
  return `${Math.round(km)} km`;
}

export function formatFileSize(bytes) {
  if (!Number.isFinite(bytes)) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function formatHours(hours) {
  if (!hours) return 'Hours not listed';
  if (hours.open24h) return 'Open 24 hours';
  return `${formatTime(hours.open)} – ${formatTime(hours.close)}`;
}

export function pluralize(count, singular, plural = `${singular}s`) {
  return `${count} ${count === 1 ? singular : plural}`;
}
