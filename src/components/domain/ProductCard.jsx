import { Link } from 'react-router-dom';
import { ShoppingBag, Store } from 'lucide-react';
import Button from '../ui/Button';
import { ProductArt } from '../brand/Illustrations';
import StockBadge, { RxBadge } from './StockBadge';
import { formatCurrency } from '../../utils/format';
import { stockLevel } from '../../utils/inventory';

/** Catalogue row: artwork · name/pack/price/stock · add to cart. */
export default function ProductCard({ listing, onAdd, showPharmacy = true }) {
  const { medicine, pharmacy } = listing;
  const unavailable = stockLevel(listing) === 'out';
  const detailsPath = `/medicines/${pharmacy.id}/${medicine.id}`;

  return (
    <article className="product-row">
      <Link to={detailsPath} className="product-row__art" tabIndex={-1} aria-hidden="true">
        <ProductArt medicine={medicine} size={58} />
      </Link>
      <div className="product-row__body">
        <h3 className="product-row__title">
          <Link to={detailsPath}>{medicine.name}</Link>
        </h3>
        <p className="text-xs subtle">
          {medicine.packSize} · {medicine.label}
        </p>
        <p className="product-row__price">
          {formatCurrency(listing.price)} <s>{formatCurrency(medicine.mrp)}</s>
        </p>
        <div className="cluster" style={{ gap: 6 }}>
          <StockBadge listing={listing} />
          {medicine.rxRequired && <RxBadge />}
        </div>
        {showPharmacy && (
          <p className="product-row__pharmacy">
            <Store size={13} aria-hidden="true" />
            {pharmacy.name}, {pharmacy.area}
          </p>
        )}
      </div>
      <Button
        size="sm"
        variant="primary"
        icon={ShoppingBag}
        onClick={() => onAdd(listing)}
        disabled={unavailable}
        className="product-row__add"
        aria-label={`Add ${medicine.name} from ${pharmacy.name} to cart`}
      >
        {unavailable ? 'Out of stock' : 'Add to Cart'}
      </Button>
    </article>
  );
}
