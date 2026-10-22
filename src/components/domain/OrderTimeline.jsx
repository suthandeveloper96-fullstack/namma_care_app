import { Check, X } from 'lucide-react';
import { ORDER_STATUS, buildTimeline } from '../../utils/orderStatus';
import { formatDateTime } from '../../utils/format';

export default function OrderTimeline({ order }) {
  const steps = buildTimeline(order);
  return (
    <ol className="timeline">
      {steps.map((step) => (
        <li key={step.status} className={`timeline__step timeline__step--${step.state}`}>
          <span className="timeline__marker" aria-hidden="true">
            {step.state === 'failed' ? <X size={14} /> : step.state !== 'upcoming' ? <Check size={14} /> : null}
          </span>
          <div className="timeline__content">
            <p className="timeline__label">
              {step.label}
              {step.state === 'current' && step.status !== 'delivered' && <span className="sr-only"> (current status)</span>}
            </p>
            <p className="text-xs subtle">
              {step.entry ? formatDateTime(step.entry.at) : 'Pending'}
              {step.entry?.note ? ` · ${step.entry.note}` : ''}
            </p>
            {(step.state === 'current' || step.state === 'failed') && (
              <p className="text-sm muted" style={{ marginTop: 4 }}>
                {ORDER_STATUS[step.status].description}
              </p>
            )}
          </div>
        </li>
      ))}
    </ol>
  );
}
