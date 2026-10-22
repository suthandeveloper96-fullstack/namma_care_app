import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { toDateKey } from '../../utils/date';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function monthStart(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

/**
 * Month grid where only dates in `freeCounts` with a positive count can be picked.
 * Navigation is limited to months that contain selectable dates.
 */
export default function MonthCalendar({ value, onChange, freeCounts, now }) {
  const keys = Object.keys(freeCounts).sort();
  const first = monthStart(now);
  const last = keys.length ? monthStart(new Date(`${keys[keys.length - 1]}T00:00`)) : first;
  const [month, setMonth] = useState(() => (value ? monthStart(new Date(`${value}T00:00`)) : first));

  const offset = month.getDay();
  const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const cells = [
    ...Array.from({ length: offset }, (_, i) => ({ key: `pad-${i}` })),
    ...Array.from({ length: daysInMonth }, (_, i) => {
      const date = new Date(month.getFullYear(), month.getMonth(), i + 1);
      const key = toDateKey(date);
      return { key, day: i + 1, free: freeCounts[key] ?? 0, inWindow: key in freeCounts };
    }),
  ];
  const canPrev = month > first;
  const canNext = month < last;
  const shift = (delta) => setMonth(new Date(month.getFullYear(), month.getMonth() + delta, 1));
  const todayKey = toDateKey(now);

  return (
    <div className="calendar">
      <div className="calendar__head">
        <button type="button" className="calendar__nav" onClick={() => shift(-1)} disabled={!canPrev} aria-label="Previous month">
          <ChevronLeft size={16} aria-hidden="true" />
        </button>
        <p className="calendar__title" aria-live="polite">
          {month.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
        </p>
        <button type="button" className="calendar__nav" onClick={() => shift(1)} disabled={!canNext} aria-label="Next month">
          <ChevronRight size={16} aria-hidden="true" />
        </button>
      </div>
      <div className="calendar__grid" role="grid" aria-label="Appointment date">
        {WEEKDAYS.map((d) => (
          <span key={d} className="calendar__weekday" role="columnheader">
            {d}
          </span>
        ))}
        {cells.map((cell) =>
          cell.day ? (
            <button
              key={cell.key}
              type="button"
              role="gridcell"
              className={`calendar__day${cell.key === todayKey ? ' calendar__day--today' : ''}${cell.inWindow && cell.free ? ' calendar__day--open' : ''}`}
              aria-selected={cell.key === value}
              aria-label={`${cell.key}${cell.inWindow ? `, ${cell.free} open slots` : ', unavailable'}`}
              disabled={!cell.inWindow || !cell.free}
              onClick={() => onChange(cell.key)}
            >
              {cell.day}
            </button>
          ) : (
            <span key={cell.key} aria-hidden="true" />
          ),
        )}
      </div>
      <p className="calendar__legend text-xs subtle">
        <i className="calendar__dot" aria-hidden="true" /> Dates with open demo slots (next 14 days)
      </p>
    </div>
  );
}
