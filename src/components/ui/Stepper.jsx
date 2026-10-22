import { Check } from 'lucide-react';

/** Numbered progress steps joined by a line; `current` is the zero-based active step. */
export default function Stepper({ steps, current, label = 'Progress' }) {
  return (
    <ol className="num-stepper" aria-label={label}>
      {steps.map((step, i) => {
        const state = i < current ? 'done' : i === current ? 'current' : 'upcoming';
        return (
          <li key={step} className={`num-stepper__item num-stepper__item--${state}`} aria-current={i === current ? 'step' : undefined}>
            <span className="num-stepper__dot">{state === 'done' ? <Check size={14} aria-hidden="true" /> : i + 1}</span>
            <span className="num-stepper__label">{step}</span>
          </li>
        );
      })}
    </ol>
  );
}
