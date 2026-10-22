import { useSearchParams } from 'react-router-dom';
import { Search, SearchX, X } from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';
import Alert from '../components/ui/Alert';
import Button from '../components/ui/Button';
import EmptyState from '../components/ui/EmptyState';
import FilterSelect from '../components/ui/FilterSelect';
import LocationSelector from '../components/layout/LocationSelector';
import DoctorCard from '../components/domain/DoctorCard';
import { getHospitalById } from '../data/hospitals';
import { SPECIALTIES } from '../data/specialties';
import { useDoctorViews } from '../hooks/useDoctorViews';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { useNow } from '../hooks/useNow';
import { getWindowDates } from '../utils/booking';
import { combineDateTime } from '../utils/date';
import { DOCTOR_STATUSES } from '../utils/doctorStatus';
import { formatCurrency, formatDayLabel, pluralize } from '../utils/format';

const DISTANCE_OPTIONS = [
  ['', 'Any Distance'],
  ['5', 'Within 5 km'],
  ['10', 'Within 10 km'],
  ['25', 'Within 25 km'],
  ['100', 'Within 100 km'],
];
const FEE_OPTIONS = [
  ['', 'Any Fee'],
  ['400', `Up to ${formatCurrency(400)}`],
  ['600', `Up to ${formatCurrency(600)}`],
  ['800', `Up to ${formatCurrency(800)}`],
];
const SORT_OPTIONS = [
  ['distance', 'Distance'],
  ['fee', 'Lowest fee'],
  ['slot', 'Earliest slot'],
];
const FILTER_KEYS = ['q', 'specialty', 'hospital', 'status', 'km', 'fee', 'date'];

function slotTime(view) {
  return view.nextSlot ? combineDateTime(view.nextSlot.date, view.nextSlot.time).getTime() : Number.POSITIVE_INFINITY;
}

const SORTERS = {
  distance: (a, b) => a.distanceKm - b.distanceKm,
  fee: (a, b) => a.doctor.fee - b.doctor.fee || a.distanceKm - b.distanceKm,
  slot: (a, b) => slotTime(a) - slotTime(b) || a.distanceKm - b.distanceKm,
};

function matchesQuery(view, q) {
  if (!q) return true;
  const haystack = [view.doctor.name, view.specialty?.name, view.hospital.name, view.hospital.area, view.hospital.city]
    .join(' ')
    .toLowerCase();
  return q
    .toLowerCase()
    .split(/\s+/)
    .every((term) => haystack.includes(term));
}

export default function FindDoctorsPage() {
  useDocumentTitle('Find Doctors');
  const now = useNow();
  const [params, setParams] = useSearchParams();

  const q = params.get('q') ?? '';
  const specialty = params.get('specialty') ?? '';
  const hospitalId = params.get('hospital') ?? '';
  const statuses = (params.get('status') ?? '').split(',').filter((s) => DOCTOR_STATUSES[s]);
  const maxKm = Number(params.get('km')) || null;
  const maxFee = Number(params.get('fee')) || null;
  const windowDates = getWindowDates(now);
  const date = windowDates.includes(params.get('date')) ? params.get('date') : '';
  const sort = SORTERS[params.get('sort')] ? params.get('sort') : 'distance';
  const hospital = getHospitalById(hospitalId);

  const views = useDoctorViews(now, { onDate: date || null });

  const update = (changes) => {
    const next = new URLSearchParams(params);
    Object.entries(changes).forEach(([key, value]) => (value ? next.set(key, value) : next.delete(key)));
    setParams(next, { replace: true });
  };

  const clearAll = () => {
    const next = new URLSearchParams(params);
    FILTER_KEYS.forEach((k) => next.delete(k));
    setParams(next, { replace: true });
  };

  const results = views
    .filter((v) => matchesQuery(v, q.trim()))
    .filter((v) => !specialty || v.doctor.specialtyId === specialty)
    .filter((v) => !hospitalId || v.hospital.id === hospitalId)
    .filter((v) => !statuses.length || statuses.includes(v.status.key))
    .filter((v) => !maxKm || v.distanceKm <= maxKm)
    .filter((v) => !maxFee || v.doctor.fee <= maxFee)
    .filter((v) => !date || v.nextSlot)
    .sort(SORTERS[sort]);

  const activeCount = FILTER_KEYS.filter((k) => params.get(k)).length;

  return (
    <div className="container page">
      <PageHeader title="Find Doctors" description="Search and book appointments with nearby doctors. All profiles and statuses are simulated demo data." />

      <div className="filter-panel">
        <form className="search-row" role="search" onSubmit={(e) => e.preventDefault()}>
          <div className="input-group search-row__input">
            <Search aria-hidden="true" />
            <label htmlFor="doctor-search" className="sr-only">
              Search by doctor name, specialty or hospital
            </label>
            <input
              id="doctor-search"
              className="input"
              type="search"
              placeholder="Search by doctor name, specialty, hospital…"
              value={q}
              onChange={(e) => update({ q: e.target.value })}
            />
          </div>
          <LocationSelector compact />
          <button type="submit" className="btn btn--primary btn--icon" aria-label="Search">
            <Search size={18} aria-hidden="true" />
          </button>
        </form>

        <div className="filter-bar">
          <FilterSelect
            id="f-specialty"
            label="Specialty"
            value={specialty}
            onChange={(v) => update({ specialty: v })}
            options={[['', 'All Specialties'], ...SPECIALTIES.map((s) => [s.id, s.name])]}
          />
          <FilterSelect id="f-km" label="Distance" value={params.get('km') ?? ''} onChange={(v) => update({ km: v })} options={DISTANCE_OPTIONS} />
          <FilterSelect id="f-fee" label="Fee Range" value={params.get('fee') ?? ''} onChange={(v) => update({ fee: v })} options={FEE_OPTIONS} />
          <FilterSelect
            id="f-status"
            label="Availability"
            value={statuses.length === 1 ? statuses[0] : ''}
            onChange={(v) => update({ status: v })}
            options={[['', 'Any Status'], ...Object.entries(DOCTOR_STATUSES).map(([k, s]) => [k, s.label])]}
          />
          <FilterSelect
            id="f-date"
            label="Date"
            value={date}
            onChange={(v) => update({ date: v })}
            options={[['', 'Any Date'], ...windowDates.map((d) => [d, formatDayLabel(d, now)])]}
          />
          <button type="button" className="filter-bar__clear" onClick={clearAll} disabled={!activeCount}>
            Clear All
          </button>
        </div>
      </div>

      <div className="results-head">
        <p className="text-sm muted" aria-live="polite">
          <strong className="text-dark">{pluralize(results.length, 'doctor')}</strong> found
          {hospital && (
            <button type="button" className="chip chip--active chip--sm" onClick={() => update({ hospital: '' })}>
              {hospital.name}
              <X size={13} aria-label="Remove hospital filter" />
            </button>
          )}
        </p>
        <label className="sort-select" htmlFor="doctor-sort">
          Sort by:
          <select id="doctor-sort" value={sort} onChange={(e) => update({ sort: e.target.value })}>
            {SORT_OPTIONS.map(([v, l]) => (
              <option key={v} value={v}>
                {l}
              </option>
            ))}
          </select>
        </label>
      </div>

      {results.length ? (
        <div className="stack stack--sm doctor-list">
          {results.map((v) => (
            <DoctorCard key={v.id} view={v} now={now} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={SearchX}
          title="No doctors match these filters"
          actions={
            <Button variant="primary" onClick={clearAll}>
              Clear all filters
            </Button>
          }
        >
          Try a different specialty, widen the distance, or choose another date.
        </EmptyState>
      )}

      <Alert tone="demo" className="mt-6">
        Availability is <strong>simulated demo data</strong>, not live information from any hospital. Each status shows when it
        was last updated; anything older than 2 hours appears as “Status Unknown”.
      </Alert>
    </div>
  );
}
