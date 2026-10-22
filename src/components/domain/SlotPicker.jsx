import { useMemo } from 'react';
import { formatTime } from '../../utils/format';

const STATE_LABEL = { past: 'Passed', booked: 'Booked', yours: 'Your booking' };

function groupByPeriod(slots) {
  const groups = { Morning: [], Afternoon: [], Evening: [] };
  slots.forEach((slot) => {
    const hour = Number(slot.time.slice(0, 2));
    if (hour < 12) groups.Morning.push(slot);
    else if (hour < 16) groups.Afternoon.push(slot);
    else groups.Evening.push(slot);
  });
  return Object.entries(groups).filter(([, list]) => list.length);
}

/** Grid of time slots; unavailable slots are rendered disabled with a reason. */
export function SlotGrid({ slots, value, onChange }) {
  const groups = useMemo(() => groupByPeriod(slots), [slots]);
  if (!slots.length) return <p className="muted text-sm">The doctor does not consult on this day.</p>;
  return (
    <div className="stack">
      {groups.map(([period, list]) => (
        <fieldset key={period} className="slot-group">
          <legend>{period}</legend>
          <div className="slot-grid">
            {list.map((slot) => {
              const disabled = slot.state !== 'free';
              const selected = slot.time === value;
              return (
                <button
                  key={slot.time}
                  type="button"
                  className={`slot slot--${slot.state}`}
                  aria-pressed={selected}
                  disabled={disabled}
                  onClick={() => onChange(slot.time)}
                  aria-label={`${formatTime(slot.time)}${disabled ? `, ${STATE_LABEL[slot.state]}` : ''}`}
                  title={disabled ? STATE_LABEL[slot.state] : undefined}
                >
                  {formatTime(slot.time)}
                </button>
              );
            })}
          </div>
        </fieldset>
      ))}
      <div className="slot-legend text-xs subtle" aria-hidden="true">
        <span><i className="slot-key slot-key--free" /> Open</span>
        <span><i className="slot-key slot-key--booked" /> Booked / passed</span>
        <span><i className="slot-key slot-key--yours" /> Your booking</span>
      </div>
    </div>
  );
}
