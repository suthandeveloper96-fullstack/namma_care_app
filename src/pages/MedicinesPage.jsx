import { useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { LayoutGrid, PackageSearch, Search } from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';
import Alert from '../components/ui/Alert';
import Button from '../components/ui/Button';
import EmptyState from '../components/ui/EmptyState';
import FilterSelect from '../components/ui/FilterSelect';
import CartBar from '../components/domain/CartBar';
import ProductCard from '../components/domain/ProductCard';
import DataIcon from '../components/domain/SpecialtyIcon';
import { MEDICINE_CATEGORIES } from '../data/medicines';
import { PHARMACIES, getPharmacyById } from '../data/pharmacies';
import { useAddToCart } from '../hooks/useAddToCart';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { useListings } from '../hooks/usePharmacyData';
import { pluralize } from '../utils/format';
import { stockLevel } from '../utils/inventory';

const SORTS = {
  relevance: (a, b) => a.distanceKm - b.distanceKm || a.medicine.name.localeCompare(b.medicine.name),
  'price-asc': (a, b) => a.price - b.price,
  'price-desc': (a, b) => b.price - a.price,
  name: (a, b) => a.medicine.name.localeCompare(b.medicine.name),
};

/**
 * Without a pharmacy filter, each product is shown once — from the nearest pharmacy that has it
 * in stock (or the nearest listing if none do) — with a count of other pharmacies stocking it.
 */
function pickNearestPerMedicine(listings) {
  const byMedicine = new Map();
  listings.forEach((l) => {
    const list = byMedicine.get(l.medicineId) ?? [];
    list.push(l);
    byMedicine.set(l.medicineId, list);
  });
  return [...byMedicine.values()].map((list) => {
    const sorted = [...list].sort((a, b) => a.distanceKm - b.distanceKm);
    const best = sorted.find((l) => stockLevel(l) !== 'out') ?? sorted[0];
    return { ...best, otherCount: list.length - 1 };
  });
}

const TOP_TABS = ['prescription', 'first-aid', 'thermometers', 'dressings', 'ors'];

export default function MedicinesPage() {
  useDocumentTitle('Medicine Catalogue');
  const [params, setParams] = useSearchParams();
  const listings = useListings();
  const { add, dialog } = useAddToCart();

  const q = params.get('q') ?? '';
  const category = params.get('category') ?? '';
  const pharmacy = getPharmacyById(params.get('pharmacy'));
  const rx = params.get('rx') ?? '';
  const inStock = params.get('stock') === '1';
  const sort = SORTS[params.get('sort')] ? params.get('sort') : 'relevance';

  const update = (changes) => {
    const next = new URLSearchParams(params);
    Object.entries(changes).forEach(([k, v]) => (v ? next.set(k, v) : next.delete(k)));
    setParams(next, { replace: true });
  };

  const base = useMemo(
    () => (pharmacy ? listings.filter((l) => l.pharmacyId === pharmacy.id) : pickNearestPerMedicine(listings)),
    [listings, pharmacy],
  );
  const term = q.trim().toLowerCase();
  const results = base
    .filter((l) => !term || `${l.medicine.name} ${l.medicine.packSize}`.toLowerCase().includes(term))
    .filter((l) => !category || l.medicine.categoryId === category)
    .filter((l) => !rx || (rx === 'rx' ? l.medicine.rxRequired : !l.medicine.rxRequired))
    .filter((l) => !inStock || stockLevel(l) !== 'out')
    .sort(SORTS[sort]);
  const countFor = (id) => base.filter((l) => l.medicine.categoryId === id).length;

  return (
    <div className="container page">
      <PageHeader title="Medicine Catalogue" description="Sample products from fictional pharmacies. Prices are illustrative demo values in INR." />

      <div className="filter-panel">
        <div className="search-row">
          <div className="input-group search-row__input">
            <Search aria-hidden="true" />
            <label htmlFor="medicine-search" className="sr-only">
              Search medicines
            </label>
            <input
              id="medicine-search"
              className="input"
              type="search"
              placeholder="Search medicines…"
              value={q}
              onChange={(e) => update({ q: e.target.value })}
            />
          </div>
        </div>
        <div className="pill-tabs" role="group" aria-label="Quick categories">
          <button type="button" className="pill-tab" aria-pressed={!category} onClick={() => update({ category: '' })}>
            All
          </button>
          {TOP_TABS.map((id) => {
            const c = MEDICINE_CATEGORIES.find((cat) => cat.id === id);
            return (
              <button key={id} type="button" className="pill-tab" aria-pressed={category === id} onClick={() => update({ category: id })}>
                {c.short}
              </button>
            );
          })}
        </div>
      </div>

      <div className="catalogue">
        <aside className="catalogue__sidebar" aria-label="Categories">
          <button type="button" className="cat-link" aria-pressed={!category} onClick={() => update({ category: '' })}>
            <LayoutGrid size={16} aria-hidden="true" />
            All Categories
            <span>{base.length}</span>
          </button>
          {MEDICINE_CATEGORIES.map((c) => (
            <button key={c.id} type="button" className="cat-link" aria-pressed={category === c.id} onClick={() => update({ category: c.id })}>
              <DataIcon name={c.icon} size={16} />
              {c.name}
              <span>{countFor(c.id)}</span>
            </button>
          ))}
        </aside>

        <section className="stack" aria-label="Products">
          <div className="filter-bar filter-bar--inline">
            <FilterSelect
              id="m-pharmacy"
              label="Pharmacy"
              value={pharmacy?.id ?? ''}
              onChange={(v) => update({ pharmacy: v })}
              options={[['', 'Nearest per product'], ...PHARMACIES.map((p) => [p.id, `${p.name} (${p.city})`])]}
            />
            <FilterSelect
              id="m-rx"
              label="Prescription"
              value={rx}
              onChange={(v) => update({ rx: v })}
              options={[
                ['', 'All products'],
                ['otc', 'No prescription needed'],
                ['rx', 'Prescription only'],
              ]}
            />
            <FilterSelect
              id="m-sort"
              label="Sort by"
              value={sort}
              onChange={(v) => update({ sort: v })}
              options={[
                ['relevance', 'Nearest'],
                ['price-asc', 'Price: low to high'],
                ['price-desc', 'Price: high to low'],
                ['name', 'Name A–Z'],
              ]}
            />
            <label className="checkbox">
              <input type="checkbox" checked={inStock} onChange={(e) => update({ stock: e.target.checked ? '1' : '' })} />
              In stock only
            </label>
          </div>

          <p className="text-sm muted" aria-live="polite">
            <strong className="text-dark">{pluralize(results.length, 'product')}</strong>
            {pharmacy ? ` at ${pharmacy.name}` : ''}
          </p>

          {results.length ? (
            <div className="product-list">
              {results.map((l) => (
                <div key={l.key} className="product-list__item">
                  <ProductCard listing={l} onAdd={add} />
                  {!pharmacy && l.otherCount > 0 && (
                    <Link to={`/medicines/${l.pharmacyId}/${l.medicineId}`} className="compare-link">
                      Compare at {pluralize(l.otherCount, 'other pharmacy', 'other pharmacies')}
                    </Link>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={PackageSearch}
              title="No products found"
              actions={
                <Button variant="primary" onClick={() => setParams({}, { replace: true })}>
                  Clear all filters
                </Button>
              }
            >
              Try another search term or category.
            </EmptyState>
          )}

          <Alert tone="info">
            NammaCare does not recommend medicines or diagnose symptoms. Items marked <strong>Rx</strong> need a prescription
            reviewed by a licensed pharmacist (simulated here).
          </Alert>
        </section>
      </div>
      <CartBar />
      {dialog}
    </div>
  );
}
