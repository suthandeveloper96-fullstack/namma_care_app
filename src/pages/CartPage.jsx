import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Bike, Lock, ShoppingBag } from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';
import Alert from '../components/ui/Alert';
import Button from '../components/ui/Button';
import EmptyState from '../components/ui/EmptyState';
import Stepper from '../components/ui/Stepper';
import { PharmacyLogo } from '../components/brand/Illustrations';
import CartLines from '../components/domain/CartLines';
import OrderSummary, { CHECKOUT_STEPS } from '../components/domain/OrderSummary';
import PrescriptionUpload from '../components/domain/PrescriptionUpload';
import { getPharmacyById } from '../data/pharmacies';
import { selectCart } from '../features/cart/cartSlice';
import { selectInventory } from '../features/inventory/inventorySlice';
import { getCheckoutBlockers } from '../features/orders/orderThunks';
import { selectPrescriptionById } from '../features/prescriptions/prescriptionsSlice';
import { selectProfile } from '../features/profile/profileSlice';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { computeTotals, resolveCartLines } from '../utils/inventory';

export default function CartPage() {
  useDocumentTitle('Cart');
  const navigate = useNavigate();
  const cart = useSelector(selectCart);
  const inventory = useSelector(selectInventory);
  const profile = useSelector(selectProfile);
  const prescription = useSelector(selectPrescriptionById(cart.prescriptionId));
  const prescriptions = useSelector((s) => s.prescriptions);

  if (!cart.items.length) {
    return (
      <div className="container page narrow">
        <PageHeader title="Your Cart" />
        <EmptyState
          icon={ShoppingBag}
          title="Your cart is empty"
          actions={
            <>
              <Button to="/medicines" variant="primary">
                Browse medicines
              </Button>
              <Button to="/pharmacies" variant="outline">
                Find a pharmacy
              </Button>
            </>
          }
        >
          Add pharmacy essentials from a demo pharmacy to place a simulated order.
        </EmptyState>
      </div>
    );
  }

  const pharmacy = getPharmacyById(cart.pharmacyId);
  const lines = resolveCartLines(cart, inventory);
  const totals = computeTotals(lines, pharmacy);
  const hasRx = lines.some((l) => l.medicine?.rxRequired);
  const blockers = getCheckoutBlockers({ cart, inventory, prescriptions });

  return (
    <div className="container page">
      <PageHeader title="Your Cart" />
      <div className="panel checkout-stepper">
        <Stepper steps={CHECKOUT_STEPS} current={0} label="Checkout progress" />
      </div>

      <div className="with-sidebar with-sidebar--right">
        <div className="stack">
          <section className="panel" aria-label="Cart items">
            <div className="cart-pharmacy">
              <PharmacyLogo pharmacy={pharmacy} size={40} />
              <div>
                <Link to={`/pharmacies/${pharmacy.id}`} className="fw-600">
                  {pharmacy.name}
                </Link>
                <p className="text-xs subtle">
                  {pharmacy.area}, {pharmacy.city} · demo orders are fulfilled by one pharmacy at a time
                </p>
              </div>
            </div>
            <CartLines lines={lines} pharmacyId={pharmacy.id} />
            <Link to={`/medicines?pharmacy=${pharmacy.id}`} className="kbd-link text-sm">
              + Add more from {pharmacy.name}
            </Link>
          </section>

          {hasRx && <PrescriptionUpload prescription={prescription} patientName={profile.name} />}
        </div>

        <aside className="panel stack sticky-panel" aria-labelledby="summary-heading">
          <h2 id="summary-heading" className="panel__title">
            Order Summary
          </h2>
          <OrderSummary totals={totals} pharmacy={pharmacy}>
            <p className="meta-row text-sm">
              <span>
                <Bike aria-hidden="true" />
                {pharmacy.delivery.available
                  ? `Demo delivery in ${pharmacy.delivery.etaMin}–${pharmacy.delivery.etaMax} min`
                  : 'This pharmacy does not deliver'}
              </span>
            </p>
          </OrderSummary>
          {blockers.length > 0 && (
            <Alert tone="warning" icon={Lock} title="Checkout locked">
              <ul className="plain-list">
                {blockers.map((b) => (
                  <li key={b}>{b}</li>
                ))}
              </ul>
            </Alert>
          )}
          <Button variant="primary" size="lg" block disabled={blockers.length > 0} onClick={() => navigate('/checkout')}>
            Proceed to checkout
          </Button>
          <p className="text-xs subtle">No real payment is taken. Checkout is a demo.</p>
        </aside>
      </div>
    </div>
  );
}
