import { useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { CircleCheckBig, Clock, MapPin, Package, Store, Truck } from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';
import Alert from '../components/ui/Alert';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import { ErrorState } from '../components/ui/EmptyState';
import OrderTimeline from '../components/domain/OrderTimeline';
import { getPharmacyById } from '../data/pharmacies';
import { selectOrderById } from '../features/orders/ordersSlice';
import { changeOrderStatus } from '../features/orders/orderThunks';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { useToast } from '../hooks/useToast';
import { formatCurrency, formatDateTime, formatHours } from '../utils/format';
import { ORDER_STATUS, PATIENT_CANCELLABLE } from '../utils/orderStatus';
import { maskPhone } from '../utils/text';

export default function OrderTrackingPage() {
  const { orderId } = useParams();
  const [params] = useSearchParams();
  const dispatch = useDispatch();
  const toast = useToast();
  const order = useSelector(selectOrderById(orderId));
  const [confirmOpen, setConfirmOpen] = useState(false);
  useDocumentTitle(order ? `Order ${order.ref}` : 'Order not found');

  if (!order) {
    return (
      <div className="container page">
        <ErrorState
          title="Order not found"
          actions={
            <>
              <Button to="/orders" variant="primary">My orders</Button>
              <Button to="/medicines">Browse medicines</Button>
            </>
          }
        >
          It may have been removed when demo data was reset, or the link is incorrect.
        </ErrorState>
      </div>
    );
  }

  const pharmacy = getPharmacyById(order.pharmacyId);
  const status = ORDER_STATUS[order.status];
  const justPlaced = params.get('placed') === '1';
  const cancellable = order.owner === 'me' && PATIENT_CANCELLABLE.includes(order.status);

  const cancel = () => {
    const result = dispatch(changeOrderStatus({ id: order.id, status: 'cancelled', actor: 'patient', note: 'Cancelled by patient' }));
    setConfirmOpen(false);
    if (result.ok) toast('Demo order cancelled', { tone: 'info', message: 'Reserved stock was released.' });
    else toast('Could not cancel', { tone: 'danger', message: result.error });
  };

  return (
    <div className="container page">
      <PageHeader
        breadcrumbs={[{ label: 'Home', to: '/' }, { label: 'My orders', to: '/orders' }, { label: order.ref }]}
        eyebrow="Order tracking"
        eyebrowIcon={Truck}
        title={justPlaced && order.status === 'awaiting_review' ? 'Demo order placed' : `Order ${order.ref}`}
        actions={<Badge tone={status.tone}>{status.label}</Badge>}
      />

      {justPlaced && (
        <div className="confirmation-hero card card--tint">
          <CircleCheckBig size={40} aria-hidden="true" />
          <div>
            <p className="fw-600">Your simulated order was recorded in this browser.</p>
            <p className="text-sm muted">
              Demo reference <strong className="tabular">{order.ref}</strong> · placed {formatDateTime(order.createdAt)}
            </p>
          </div>
        </div>
      )}

      <Alert tone="demo" className="mb-6">
        Tracking is simulated and not connected to a real pharmacy or courier. Advance this order from the{' '}
        <Link to="/dashboard/pharmacy">demo pharmacy dashboard</Link>; changes appear here instantly (and in other tabs of
        this browser).
      </Alert>

      <div className="with-sidebar with-sidebar--right">
        <div className="stack stack--lg">
          <section className="card card--pad-lg stack" aria-labelledby="timeline-heading">
            <h2 id="timeline-heading" className="card-title">
              Order timeline
            </h2>
            {order.status === 'rejected' && (
              <Alert tone="danger" title="The demo pharmacy rejected this order">
                {order.history.find((h) => h.status === 'rejected')?.note ||
                  'The pharmacy could not fulfil it.'}{' '}
                Reserved stock has been released. No payment was taken.
              </Alert>
            )}
            {order.status === 'cancelled' && (
              <Alert tone="info" title="This order was cancelled">
                No payment was taken and reserved stock has been released.
              </Alert>
            )}
            <OrderTimeline order={order} />
          </section>

          <section className="card card--pad-lg stack" aria-labelledby="items-heading">
            <h2 id="items-heading" className="card-title">
              Items
            </h2>
            <ul className="mini-lines">
              {order.items.map((item) => (
                <li key={item.medicineId}>
                  <span>
                    {item.name} <span className="subtle">× {item.qty}</span>
                    {item.rxRequired && <span className="badge badge--rx" style={{ marginLeft: 8 }}>Rx</span>}
                  </span>
                  <span className="tabular">{formatCurrency(item.price * item.qty)}</span>
                </li>
              ))}
            </ul>
            <dl className="summary-list">
              <div>
                <dt>Subtotal</dt>
                <dd>{formatCurrency(order.subtotal)}</dd>
              </div>
              <div>
                <dt>Delivery fee (simulated)</dt>
                <dd>{order.deliveryFee ? formatCurrency(order.deliveryFee) : 'Free'}</dd>
              </div>
              <div className="summary-list__total">
                <dt>Total (pay on delivery, demo)</dt>
                <dd>{formatCurrency(order.total)}</dd>
              </div>
            </dl>
          </section>
        </div>

        <aside className="stack sticky-panel">
          <section className="card card--pad stack" aria-labelledby="pharmacy-heading">
            <h2 id="pharmacy-heading" className="card-title">
              Pharmacy
            </h2>
            <p className="meta-row">
              <span>
                <Store aria-hidden="true" />
                <Link to={`/pharmacies/${pharmacy.id}`} className="fw-600">
                  {pharmacy.name}
                </Link>
              </span>
            </p>
            <p className="meta-row">
              <span>
                <MapPin aria-hidden="true" />
                {pharmacy.address}, {pharmacy.city}
              </span>
            </p>
            <p className="meta-row">
              <span>
                <Clock aria-hidden="true" />
                {formatHours(pharmacy.hours)}
              </span>
            </p>
          </section>
          <section className="card card--pad stack" aria-labelledby="address-heading">
            <h2 id="address-heading" className="card-title">
              Delivery address
            </h2>
            <address className="text-sm" style={{ fontStyle: 'normal' }}>
              <strong>{order.address.name}</strong>
              <br />
              {order.address.line1}
              <br />
              {order.address.city} {order.address.pin}
              <br />
              <span className="subtle">Mobile {maskPhone(order.address.phone)}</span>
            </address>
          </section>
          {cancellable && (
            <Button variant="danger" onClick={() => setConfirmOpen(true)} icon={Package}>
              Cancel order
            </Button>
          )}
          <Button to="/orders">All orders</Button>
        </aside>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        title="Cancel this demo order?"
        tone="danger"
        confirmLabel="Cancel order"
        cancelLabel="Keep order"
        onCancel={() => setConfirmOpen(false)}
        onConfirm={cancel}
      >
        Order {order.ref} will be cancelled and its reserved stock returned to {pharmacy.name}.
      </ConfirmDialog>
    </div>
  );
}
