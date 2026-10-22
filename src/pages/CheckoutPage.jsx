import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Banknote, Info, PackageCheck } from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';
import Alert from '../components/ui/Alert';
import Button from '../components/ui/Button';
import { ErrorState } from '../components/ui/EmptyState';
import { TextField, PhoneField } from '../components/ui/Field';
import { PageLoader } from '../components/ui/Spinner';
import Stepper from '../components/ui/Stepper';
import CartLines from '../components/domain/CartLines';
import OrderSummary, { CHECKOUT_STEPS } from '../components/domain/OrderSummary';
import { getPharmacyById } from '../data/pharmacies';
import { selectCart } from '../features/cart/cartSlice';
import { selectInventory } from '../features/inventory/inventorySlice';
import { ADDRESS_SCHEMA, getCheckoutBlockers, placeOrder } from '../features/orders/orderThunks';
import { profileUpdated, selectProfile } from '../features/profile/profileSlice';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { useToast } from '../hooks/useToast';
import { formatCurrency } from '../utils/format';
import { DELIVERY_OPTIONS, computeTotals, resolveCartLines } from '../utils/inventory';
import { validateFields } from '../utils/validation';

export default function CheckoutPage() {
  useDocumentTitle('Checkout');
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const toast = useToast();
  const cart = useSelector(selectCart);
  const inventory = useSelector(selectInventory);
  const prescriptions = useSelector((s) => s.prescriptions);
  const profile = useSelector(selectProfile);
  const [address, setAddress] = useState({
    name: profile.name,
    phone: profile.phone,
    line1: profile.line1,
    city: profile.city,
    pin: profile.pin,
  });
  const [deliveryOption, setDeliveryOption] = useState('standard');
  const [errors, setErrors] = useState({});
  const [saveToProfile, setSaveToProfile] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const blockers = getCheckoutBlockers({ cart, inventory, prescriptions });
  if (blockers.length && !submitting) {
    return (
      <div className="container page narrow">
        <ErrorState
          title="Checkout isn’t available yet"
          actions={
            <>
              <Button to="/cart" variant="primary">
                Back to cart
              </Button>
              <Button to="/medicines" variant="outline">
                Browse medicines
              </Button>
            </>
          }
        >
          {blockers.join(' ')}
        </ErrorState>
      </div>
    );
  }

  const pharmacy = getPharmacyById(cart.pharmacyId);
  // The cart is cleared right after a successful order, just before navigation completes.
  if (!pharmacy) return <PageLoader label="Opening your order…" />;
  const lines = resolveCartLines(cart, inventory);
  const totals = computeTotals(lines, pharmacy, deliveryOption);
  const standardFee = computeTotals(lines, pharmacy, 'standard').deliveryFee;

  const setField = (field) => (e) => {
    setAddress((a) => ({ ...a, [field]: e.target.value }));
    if (errors[field]) setErrors((errs) => ({ ...errs, [field]: '' }));
  };

  const submit = (event) => {
    event.preventDefault();
    const fieldErrors = validateFields(address, ADDRESS_SCHEMA);
    setErrors(fieldErrors);
    if (Object.keys(fieldErrors).length) {
      setSubmitError('Please fix the highlighted delivery details.');
      return;
    }
    setSubmitError('');
    setSubmitting(true);
    setTimeout(() => {
      const result = dispatch(placeOrder(address, deliveryOption));
      if (!result.ok) {
        setSubmitting(false);
        setErrors(result.fieldErrors ?? {});
        setSubmitError(result.error);
        return;
      }
      if (saveToProfile) dispatch(profileUpdated(address));
      toast('Demo order placed', { message: `Reference ${result.order.ref}` });
      navigate(`/orders/${result.order.id}?placed=1`, { replace: true });
    }, 700);
  };

  return (
    <div className="container page">
      <PageHeader breadcrumbs={[{ label: 'Cart', to: '/cart' }, { label: 'Checkout' }]} title="Checkout" />
      <div className="panel checkout-stepper">
        <Stepper steps={CHECKOUT_STEPS} current={1} label="Checkout progress" />
      </div>

      <form className="checkout-grid" onSubmit={submit} noValidate>
        <section className="panel stack" aria-labelledby="summary-heading">
          <h2 id="summary-heading" className="panel__title">
            Order Summary
          </h2>
          <p className="text-xs subtle">From {pharmacy.name}, {pharmacy.area}</p>
          <CartLines lines={lines} pharmacyId={pharmacy.id} />
          <OrderSummary totals={totals} pharmacy={pharmacy} />
        </section>

        <section className="panel stack" aria-labelledby="address-heading">
          {submitError && (
            <Alert tone="danger" title="Order not placed">
              {submitError}
            </Alert>
          )}
          <div className="checkout-columns">
            <div className="stack">
              <h2 id="address-heading" className="panel__title">
                Delivery Address
              </h2>
              <TextField label="Name" required autoComplete="name" value={address.name} onChange={setField('name')} error={errors.name} />
              <PhoneField
                label="Phone Number"
                required
                value={address.phone}
                onChange={(value) => setField('phone')({ target: { value } })}
                error={errors.phone}
              />
              <TextField
                label="PIN Code"
                required
                inputMode="numeric"
                maxLength={6}
                autoComplete="postal-code"
                value={address.pin}
                onChange={(e) => setField('pin')({ target: { value: e.target.value.replace(/\D/g, '') } })}
                error={errors.pin}
                hint="Tamil Nadu PIN codes only (demo)"
              />
              <TextField
                label="Address"
                required
                autoComplete="street-address"
                placeholder="e.g. 12 Gandhi Street, T. Nagar"
                value={address.line1}
                onChange={setField('line1')}
                error={errors.line1}
              />
              <TextField label="City" required autoComplete="address-level2" value={address.city} onChange={setField('city')} error={errors.city} />
              <label className="checkbox">
                <input type="checkbox" checked={saveToProfile} onChange={(e) => setSaveToProfile(e.target.checked)} />
                Save to my demo profile
              </label>
            </div>

            <div className="stack">
              <fieldset className="radio-group">
                <legend className="panel__title">Choose Delivery</legend>
                {Object.entries(DELIVERY_OPTIONS).map(([key, option]) => (
                  <label key={key} className="radio-card">
                    <input type="radio" name="delivery" value={key} checked={deliveryOption === key} onChange={() => setDeliveryOption(key)} />
                    <span>
                      <strong>{option.label}</strong>
                      <span className="text-xs subtle">{option.detail(pharmacy.delivery)}</span>
                    </span>
                    <span className="radio-card__price">
                      {key === 'express' ? formatCurrency(option.fee) : standardFee ? formatCurrency(standardFee) : 'Free'}
                    </span>
                  </label>
                ))}
              </fieldset>

              <div className="payment-option">
                <Banknote aria-hidden="true" />
                <div>
                  <p className="fw-600">Payment: pay on delivery (demo)</p>
                  <p className="text-xs muted">No card, UPI or bank details are requested or collected.</p>
                </div>
              </div>

              <Button type="submit" variant="primary" size="lg" block icon={PackageCheck} loading={submitting}>
                {submitting ? 'Placing demo order…' : `Place Demo Order · ${formatCurrency(totals.total)}`}
              </Button>
              <p className="note-line">
                <Info size={15} aria-hidden="true" />
                This is a demo order. No actual payment will be made and nothing will be delivered.
              </p>
            </div>
          </div>
        </section>
      </form>
    </div>
  );
}
