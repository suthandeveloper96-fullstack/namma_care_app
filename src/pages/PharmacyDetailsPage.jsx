import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Bike, Clock, MapPin, Search, Store } from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';
import Alert from '../components/ui/Alert';
import Badge, { DemoBadge } from '../components/ui/Badge';
import Button from '../components/ui/Button';
import EmptyState, { ErrorState } from '../components/ui/EmptyState';
import ProductCard from '../components/domain/ProductCard';
import { MEDICINE_CATEGORIES } from '../data/medicines';
import { getPharmacyById } from '../data/pharmacies';
import { useAddToCart } from '../hooks/useAddToCart';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { useNow } from '../hooks/useNow';
import { useListings } from '../hooks/usePharmacyData';
import { formatCurrency, formatDistance, formatHours } from '../utils/format';
import { isOpenAt } from '../utils/hours';

export default function PharmacyDetailsPage() {
  const { pharmacyId } = useParams();
  const pharmacy = getPharmacyById(pharmacyId);
  useDocumentTitle(pharmacy?.name ?? 'Pharmacy not found');
  const now = useNow();
  const listings = useListings();
  const { add, dialog } = useAddToCart();
  const [query, setQuery] = useState('');

  if (!pharmacy) {
    return (
      <div className="container page">
        <ErrorState title="Pharmacy not found" actions={<Button to="/pharmacies" variant="primary">Browse pharmacies</Button>}>
          This demo pharmacy does not exist or the link is outdated.
        </ErrorState>
      </div>
    );
  }

  const own = listings.filter((l) => l.pharmacyId === pharmacy.id);
  const q = query.trim().toLowerCase();
  const filtered = own.filter((l) => !q || l.medicine.name.toLowerCase().includes(q));
  const grouped = MEDICINE_CATEGORIES.map((c) => ({ category: c, items: filtered.filter((l) => l.medicine.categoryId === c.id) })).filter(
    (g) => g.items.length,
  );
  const open = isOpenAt(pharmacy.hours, now);
  const { delivery } = pharmacy;

  return (
    <div className="container page">
      <PageHeader
        breadcrumbs={[{ label: 'Home', to: '/' }, { label: 'Pharmacies', to: '/pharmacies' }, { label: pharmacy.name }]}
        eyebrow="Pharmacy"
        eyebrowIcon={Store}
        title={pharmacy.name}
        description={`${pharmacy.address}, ${pharmacy.city} ${pharmacy.pin}`}
        actions={<DemoBadge>Fictional pharmacy</DemoBadge>}
      />

      <div className="pharmacy-info card card--pad">
        <div className="pharmacy-info__item">
          <Clock aria-hidden="true" />
          <div>
            <p className="text-xs subtle">Demo hours</p>
            <p className="fw-600">{formatHours(pharmacy.hours)}</p>
          </div>
          <Badge tone={open ? 'success' : 'neutral'}>{open ? 'Open now' : 'Closed now'}</Badge>
        </div>
        <div className="pharmacy-info__item">
          <Bike aria-hidden="true" />
          <div>
            <p className="text-xs subtle">Delivery</p>
            <p className="fw-600">
              {delivery.available ? `${delivery.etaMin}–${delivery.etaMax} min (simulated)` : 'Store pickup only'}
            </p>
          </div>
        </div>
        {delivery.available && (
          <div className="pharmacy-info__item">
            <MapPin aria-hidden="true" />
            <div>
              <p className="text-xs subtle">Delivery fee</p>
              <p className="fw-600">
                {formatCurrency(delivery.fee)}, free above {formatCurrency(delivery.freeAbove)}
              </p>
            </div>
          </div>
        )}
        <div className="pharmacy-info__item">
          <MapPin aria-hidden="true" />
          <div>
            <p className="text-xs subtle">Distance</p>
            <p className="fw-600">{formatDistance(own[0]?.distanceKm)} (approx.)</p>
          </div>
        </div>
      </div>

      {!delivery.available && (
        <Alert tone="warning" className="mt-4">
          This demo pharmacy doesn’t deliver, so its items can’t be checked out. Choose a pharmacy with delivery to place a
          demo order.
        </Alert>
      )}

      <div className="section stack">
        <div className="results-toolbar">
          <div className="input-group results-toolbar__search">
            <Search aria-hidden="true" />
            <label htmlFor="pharmacy-product-search" className="sr-only">
              Search products at this pharmacy
            </label>
            <input
              id="pharmacy-product-search"
              className="input"
              type="search"
              placeholder={`Search ${own.length} sample products`}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </div>
        {grouped.length ? (
          grouped.map(({ category, items }) => (
            <section key={category.id} aria-labelledby={`cat-${category.id}`} className="stack">
              <h2 id={`cat-${category.id}`} className="card-title">
                {category.name}
              </h2>
              <div className="grid grid--3">
                {items.map((l) => (
                  <ProductCard key={l.key} listing={l} onAdd={add} showPharmacy={false} />
                ))}
              </div>
            </section>
          ))
        ) : (
          <EmptyState icon={Search} title="No products match" actions={<Button onClick={() => setQuery('')}>Clear search</Button>}>
            This pharmacy’s sample catalogue doesn’t include “{query}”.
          </EmptyState>
        )}
      </div>
      {dialog}
    </div>
  );
}
