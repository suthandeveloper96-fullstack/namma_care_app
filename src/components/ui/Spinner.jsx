export default function Spinner({ size, label }) {
  return (
    <span className={`spinner${size === 'sm' ? ' spinner--sm' : ''}`} role={label ? 'status' : undefined} aria-label={label}>
      {label && <span className="sr-only">{label}</span>}
    </span>
  );
}

export function PageLoader({ label = 'Loading…' }) {
  return (
    <div className="page-loader" role="status" aria-live="polite">
      <Spinner />
      <span>{label}</span>
    </div>
  );
}
