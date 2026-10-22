import { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { Building2, MapPinned, Search } from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';
import Alert from '../components/ui/Alert';
import Button from '../components/ui/Button';
import EmptyState from '../components/ui/EmptyState';
import HospitalCard from '../components/domain/HospitalCard';
import { HOSPITALS } from '../data/hospitals';
import { SPECIALTIES } from '../data/specialties';
import { selectLocation } from '../features/profile/profileSlice';
import { summarizeStatuses, useDoctorViews } from '../hooks/useDoctorViews';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { useNow } from '../hooks/useNow';
import { distanceKm } from '../utils/geo';
import { pluralize } from '../utils/format';

export default function HospitalsPage() {
  useDocumentTitle('Hospitals & Clinics');
  const now = useNow();
  const location = useSelector(selectLocation);
  const views = useDoctorViews(now);
  const [query, setQuery] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [type, setType] = useState('');

  const entries = useMemo(
    () =>
      HOSPITALS.map((hospital) => {
        const hospitalViews = views.filter((v) => v.hospital.id === hospital.id);
        return {
          hospital,
          distanceKm: distanceKm(location, hospital),
          summary: summarizeStatuses(hospitalViews),
          specialties: [...new Map(hospitalViews.map((v) => [v.specialty.id, v.specialty])).values()],
        };
      }).sort((a, b) => a.distanceKm - b.distanceKm),
    [views, location],
  );

  const q = query.trim().toLowerCase();
  const results = entries.filter(
    (e) =>
      (!q || [e.hospital.name, e.hospital.area, e.hospital.city, e.hospital.pin].join(' ').toLowerCase().includes(q)) &&
      (!specialty || e.specialties.some((s) => s.id === specialty)) &&
      (!type || e.hospital.type === type),
  );

  const reset = () => {
    setQuery('');
    setSpecialty('');
    setType('');
  };

  return (
    <div className="container page">
      <PageHeader
        eyebrow="Facilities"
        eyebrowIcon={Building2}
        title="Hospitals & clinics"
        description={`Fictional demo facilities sorted by approximate straight-line distance from ${location.area}, ${location.city}.`}
      />

      <div className="stack">
        <div className="results-toolbar">
          <div className="input-group results-toolbar__search">
            <Search aria-hidden="true" />
            <label htmlFor="hospital-search" className="sr-only">
              Search hospitals by name, area or PIN code
            </label>
            <input
              id="hospital-search"
              className="input"
              type="search"
              placeholder="Search by name, area or PIN code"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <label htmlFor="hospital-specialty" className="sr-only">
            Specialty
          </label>
          <select id="hospital-specialty" className="select results-toolbar__sort" value={specialty} onChange={(e) => setSpecialty(e.target.value)}>
            <option value="">All specialties</option>
            {SPECIALTIES.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
        <div className="chip-row" role="group" aria-label="Facility type">
          {[
            ['', 'All'],
            ['Hospital', 'Hospitals'],
            ['Clinic', 'Clinics'],
          ].map(([value, label]) => (
            <button key={label} type="button" className="chip" aria-pressed={type === value} onClick={() => setType(value)}>
              {label}
            </button>
          ))}
        </div>

        <Alert tone="info" icon={MapPinned}>
          A live map is not configured for this demo, so facilities are listed by approximate distance instead. Doctor
          counts and status summaries come from simulated data.
        </Alert>

        <p className="text-sm muted fw-600" aria-live="polite">
          {pluralize(results.length, 'facility', 'facilities')}
        </p>

        {results.length ? (
          <div className="grid grid--3">
            {results.map((e) => (
              <HospitalCard key={e.hospital.id} {...e} now={now} />
            ))}
          </div>
        ) : (
          <EmptyState icon={Building2} title="No facilities match" actions={<Button onClick={reset}>Clear filters</Button>}>
            Try another name, area or specialty.
          </EmptyState>
        )}
      </div>
    </div>
  );
}
