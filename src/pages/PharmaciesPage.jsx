import { useState } from 'react';
import { Search, Store } from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';
import Alert from '../components/ui/Alert';
import Button from '../components/ui/Button';
import EmptyState from '../components/ui/EmptyState';
import FilterSelect from '../components/ui/FilterSelect';
import PharmacyCard from '../components/domain/PharmacyCard';
import { usePharmacySummaries } from '../hooks/usePharmacyData';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { useNow } from '../hooks/useNow';
import { pluralize } from '../utils/format';
import { isOpenAt } from '../utils/hours';

const DISTANCE = [
  ['', 'Any Distance'],
  ['5', 'Within 5 km'],
  ['15', 'Within 15 km'],
  ['50', 'Within 50 km'],
];
const ETA = [
  ['', 'Any Time'],
  ['45', 'Within 45 min'],
  ['60', 'Within 60 min'],
];
const OPEN = [
  ['', 'All'],
  ['open', 'Open now'],
  ['24h', 'Open 24 hours'],
];

export default function PharmaciesPage() {
  useDocumentTitle('Nearby Pharmacies');
  const now = useNow();
  const summaries = usePharmacySummaries();
  const [draft, setDraft] = useState('');
  const [query, setQuery] = useState('');
  const [maxKm, setMaxKm] = useState('');
  const [maxEta, setMaxEta] = useState('');
  const [open, setOpen] = useState('');

  const q = query.trim().toLowerCase();
  const results = summaries.filter(({ pharmacy, distanceKm }) => {
    const matches = !q || [pharmacy.name, pharmacy.area, pharmacy.city, pharmacy.pin].join(' ').toLowerCase().includes(q);
    const withinKm = !maxKm || distanceKm <= Number(maxKm);
    const withinEta = !maxEta || (pharmacy.delivery.available && pharmacy.delivery.etaMax <= Number(maxEta));
    const openOk = !open || (open === '24h' ? pharmacy.hours.open24h : isOpenAt(pharmacy.hours, now));
    return matches && withinKm && withinEta && openOk;
  });

  const reset = () => {
    setDraft('');
    setQuery('');
    setMaxKm('');
    setMaxEta('');
    setOpen('');
  };

  return (
    <div className="container page">
      <PageHeader title="Nearby Pharmacies" description="Find demo pharmacies and get medicines delivered (simulated)." />

      <div className="filter-panel">
        <form
          className="search-row"
          role="search"
          onSubmit={(e) => {
            e.preventDefault();
            setQuery(draft);
          }}
        >
          <div className="input-group search-row__input">
            <Search aria-hidden="true" />
            <label htmlFor="pharmacy-search" className="sr-only">
              Search pharmacy by name or PIN code
            </label>
            <input
              id="pharmacy-search"
              className="input"
              type="search"
              placeholder="Search pharmacy by name or PIN code…"
              value={draft}
              onChange={(e) => {
                setDraft(e.target.value);
                setQuery(e.target.value);
              }}
            />
          </div>
          <Button type="submit" variant="primary">
            Search
          </Button>
        </form>
        <div className="filter-bar">
          <FilterSelect id="p-km" label="Distance" value={maxKm} onChange={setMaxKm} options={DISTANCE} />
          <FilterSelect id="p-eta" label="Delivery Time" value={maxEta} onChange={setMaxEta} options={ETA} />
          <FilterSelect id="p-open" label="Open Now" value={open} onChange={setOpen} options={OPEN} />
          <button type="button" className="filter-bar__clear" onClick={reset} disabled={!query && !maxKm && !maxEta && !open}>
            Clear All
          </button>
        </div>
      </div>

      <p className="results-head text-sm muted" aria-live="polite">
        <span>
          <strong className="text-dark">{pluralize(results.length, 'pharmacy', 'pharmacies')}</strong> found
        </span>
      </p>

      {results.length ? (
        <div className="stack stack--sm">
          {results.map((s) => (
            <PharmacyCard key={s.pharmacy.id} {...s} now={now} />
          ))}
        </div>
      ) : (
        <EmptyState icon={Store} title="No pharmacies match" actions={<Button onClick={reset}>Clear filters</Button>}>
          Try a different name or PIN code, or widen the distance.
        </EmptyState>
      )}

      <Alert tone="demo" className="mt-6">
        Not connected to real pharmacies or delivery services. Opening hours, stock and delivery times are illustrative.
      </Alert>
    </div>
  );
}
