import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Info, ShoppingBag, Store } from 'lucide-react';
import { Breadcrumbs } from '../components/ui/PageHeader';
import Alert from '../components/ui/Alert';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import { ErrorState } from '../components/ui/EmptyState';
import QuantityStepper from '../components/ui/QuantityStepper';
import DataIcon from '../components/domain/SpecialtyIcon';
import StockBadge, { RxBadge } from '../components/domain/StockBadge';
import { getCategoryById } from '../data/medicines';
import { useAddToCart } from '../hooks/useAddToCart';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { useListings } from '../hooks/usePharmacyData';
import { formatCurrency, formatDistance } from '../utils/format';
import { maxOrderable, stockLevel } from '../utils/inventory';

export default function ProductDetailsPage() {
  const { pharmacyId, medicineId } = useParams();
  const listings = useListings();
  const listing = listings.find((l) => l.pharmacyId === pharmacyId && l.medicineId === medicineId);
  useDocumentTitle(listing?.medicine.name ?? 'Product not found');
  const { add, dialog } = useAddToCart();
  const [qty, setQty] = useState(1);

  if (!listing) {
    return (
      <div className="container page">
        <ErrorState title="Product not found" actions={<Button to="/medicines" variant="primary">Browse catalogue</Button>}>
          This product isn’t listed at the selected demo pharmacy.
        </ErrorState>
      </div>
    );
  }

  const { medicine, pharmacy } = listing;
  const category = getCategoryById(medicine.categoryId);
  const max = maxOrderable(listing);
  const out = stockLevel(listing) === 'out';
  const alternatives = listings
    .filter((l) => l.medicineId === medicine.id && l.pharmacyId !== pharmacy.id)
    .sort((a, b) => a.distanceKm - b.distanceKm);

  return (
    <div className="container page">
      <Breadcrumbs
        items={[
          { label: 'Home', to: '/' },
          { label: 'Medicines', to: '/medicines' },
          { label: category.short, to: `/medicines?category=${category.id}` },
          { label: medicine.name },
        ]}
      />

      <div className="with-sidebar with-sidebar--right">
        <div className="stack stack--lg">
          <section className="card card--pad-lg product-hero">
            <div className="product-hero__media" aria-hidden="true">
              <DataIcon name={category.icon} size={56} />
            </div>
            <div className="stack stack--sm">
              <div className="cluster">
                <span className="eyebrow-text">{category.name}</span>
                <Badge tone="brand">{medicine.label}</Badge>
              </div>
              <h1 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)' }}>{medicine.name}</h1>
              <p className="muted">{medicine.packSize}</p>
              {medicine.rxRequired && <RxBadge />}
            </div>
          </section>

          <section className="card card--pad-lg stack" aria-labelledby="product-info">
            <h2 id="product-info" className="card-title">
              Product information
            </h2>
            <p>{medicine.description}</p>
            <dl className="dl">
              <dt>Pack size</dt>
              <dd>{medicine.packSize}</dd>
              <dt>Type</dt>
              <dd>{medicine.label}</dd>
              <dt>Storage</dt>
              <dd>{medicine.storage}</dd>
              <dt>Prescription</dt>
              <dd>{medicine.rxRequired ? 'Required — reviewed by a licensed pharmacist' : 'Not required'}</dd>
            </dl>
            <Alert tone="info" icon={Info}>
              Demo catalogue text only. It is not medical advice and not a complete product leaflet. Always read the label
              and ask a doctor or pharmacist before use.
            </Alert>
          </section>

          {alternatives.length > 0 && (
            <section className="card card--pad-lg stack" aria-labelledby="alt-heading">
              <h2 id="alt-heading" className="card-title">
                Also available at
              </h2>
              <ul className="alt-list">
                {alternatives.map((l) => (
                  <li key={l.key}>
                    <div>
                      <Link to={`/medicines/${l.pharmacyId}/${l.medicineId}`} className="fw-600">
                        {l.pharmacy.name}
                      </Link>
                      <p className="text-xs subtle">
                        {l.pharmacy.area}, {l.pharmacy.city} · {formatDistance(l.distanceKm)}
                      </p>
                    </div>
                    <StockBadge listing={l} />
                    <span className="price">{formatCurrency(l.price)}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>

        <aside className="card card--pad stack sticky-panel" aria-label="Purchase options">
          <div>
            <p className="price" style={{ fontSize: 'var(--fs-2xl)' }}>
              {formatCurrency(listing.price)}
            </p>
            <p className="text-xs subtle">
              MRP <s>{formatCurrency(medicine.mrp)}</s> · illustrative demo price
            </p>
          </div>
          <StockBadge listing={listing} showCount />
          <p className="meta-row">
            <span>
              <Store aria-hidden="true" />
              Supplied by{' '}
              <Link to={`/pharmacies/${pharmacy.id}`} className="fw-600">
                {pharmacy.name}
              </Link>
            </span>
          </p>
          {!out && (
            <div className="cluster cluster--between">
              <span className="field__label">Quantity</span>
              <QuantityStepper value={Math.min(qty, max)} min={1} max={max} onChange={setQty} label={medicine.name} />
            </div>
          )}
          <Button variant="primary" block icon={ShoppingBag} disabled={out} onClick={() => add(listing, Math.min(qty, max))}>
            {out ? 'Out of stock' : 'Add to cart'}
          </Button>
          {medicine.rxRequired && (
            <p className="text-xs muted">You’ll be asked to upload a prescription in the cart. Checkout stays locked until a simulated pharmacist review approves it.</p>
          )}
          <Button to="/cart" variant="ghost" block>
            View cart
          </Button>
        </aside>
      </div>
      {dialog}
    </div>
  );
}
