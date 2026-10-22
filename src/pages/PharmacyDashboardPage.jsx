import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Boxes, Building2, ClipboardList, FileCheck2, History, LayoutDashboard, PackageOpen, Search, Store } from 'lucide-react';
import Alert from '../components/ui/Alert';
import Badge, { DemoBadge } from '../components/ui/Badge';
import Button from '../components/ui/Button';
import EmptyState from '../components/ui/EmptyState';
import { SelectField } from '../components/ui/Field';
import FilterSelect from '../components/ui/FilterSelect';
import DashboardShell from '../components/layout/DashboardShell';
import { PharmacyLogo } from '../components/brand/Illustrations';
import Modal from '../components/ui/Modal';
import QuantityStepper from '../components/ui/QuantityStepper';
import StatTile from '../components/ui/StatTile';
import StockBadge from '../components/domain/StockBadge';
import { RX_STATUS_META } from '../components/domain/PrescriptionList';
import { getMedicineById } from '../data/medicines';
import { PHARMACIES, getPharmacyById } from '../data/pharmacies';
import { listingToggled, stockSet } from '../features/inventory/inventorySlice';
import { selectAllOrders } from '../features/orders/ordersSlice';
import { changeOrderStatus } from '../features/orders/orderThunks';
import { prescriptionReviewed, selectPrescriptions } from '../features/prescriptions/prescriptionsSlice';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { useListings } from '../hooks/usePharmacyData';
import { useToast } from '../hooks/useToast';
import { formatCurrency, formatDateTime, formatFileSize, formatRelative } from '../utils/format';
import { ORDER_STATUS, isActiveOrder, nextStatusesFor } from '../utils/orderStatus';
import { maskPhone } from '../utils/text';

const ACTION_LABELS = {
  accepted: 'Accept order',
  preparing: 'Mark preparing',
  out_for_delivery: 'Mark out for delivery',
  delivered: 'Mark delivered',
  rejected: 'Reject',
};

const REJECT_REASONS = [
  'Items unavailable at the moment',
  'Delivery address outside service area',
  'Unable to verify order details',
  'Pharmacy closing early today',
];

const RX_REJECT_REASONS = ['Prescription unclear or unreadable', 'Prescription appears expired', 'Items do not match the prescription'];

function OrderActions({ order, onReject, compact = false }) {
  const dispatch = useDispatch();
  const toast = useToast();
  const next = nextStatusesFor(order.status).filter((s) => s !== 'cancelled');

  const advance = (status) => {
    const result = dispatch(changeOrderStatus({ id: order.id, status, actor: 'pharmacy' }));
    if (result.ok) toast(`${order.ref}: ${ORDER_STATUS[status].label}`, { tone: 'info', message: 'Patient tracking page updated.' });
    else toast('Status not changed', { tone: 'danger', message: result.error });
  };

  if (!next.length) return null;
  return (
    <div className="cluster" style={compact ? { flexWrap: 'nowrap' } : undefined}>
      {next
        .filter((s) => s !== 'rejected')
        .map((s) => (
          <Button key={s} size="sm" variant="primary" onClick={() => advance(s)}>
            {ACTION_LABELS[s]}
          </Button>
        ))}
      {next.includes('rejected') && (
        <Button size="sm" variant="danger" onClick={() => onReject(order)}>
          {ACTION_LABELS.rejected}
        </Button>
      )}
    </div>
  );
}

function OrderPanel({ order, onReject }) {
  const status = ORDER_STATUS[order.status];
  return (
    <article className="card card--pad stack">
      <div className="cluster cluster--between">
        <div>
          <p className="fw-600">
            <Link to={`/orders/${order.id}`}>{order.ref}</Link>
            {order.owner === 'me' && <span className="text-xs subtle"> · your demo order</span>}
          </p>
          <p className="text-xs subtle">
            {order.address.name} · {maskPhone(order.address.phone)} · {order.address.city} {order.address.pin} · placed{' '}
            {formatRelative(order.createdAt)}
          </p>
        </div>
        <div className="cluster">
          {order.requiresPrescription && <span className="badge badge--rx">Rx verified (simulated)</span>}
          <Badge tone={status.tone}>{status.label}</Badge>
        </div>
      </div>
      <ul className="mini-lines">
        {order.items.map((i) => (
          <li key={i.medicineId}>
            <span>
              {i.name} <span className="subtle">× {i.qty}</span>
            </span>
            <span className="tabular">{formatCurrency(i.price * i.qty)}</span>
          </li>
        ))}
      </ul>
      <div className="cluster cluster--between">
        <span className="fw-600">Total {formatCurrency(order.total)}</span>
        <OrderActions order={order} onReject={onReject} />
      </div>
    </article>
  );
}

function ReasonModal({ open, title, description, reasons, confirmLabel, onCancel, onConfirm }) {
  const [reason, setReason] = useState(reasons[0]);
  return (
    <Modal
      open={open}
      title={title}
      description={description}
      onClose={onCancel}
      footer={
        <>
          <Button onClick={onCancel}>Go back</Button>
          <Button variant="danger-solid" onClick={() => onConfirm(reason)}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      <SelectField label="Reason shown to the patient" value={reason} onChange={(e) => setReason(e.target.value)} options={reasons.map((r) => ({ value: r, label: r }))} />
    </Modal>
  );
}

function PrescriptionQueue({ pharmacyId }) {
  const dispatch = useDispatch();
  const toast = useToast();
  const prescriptions = useSelector(selectPrescriptions).filter((p) => p.pharmacyId === pharmacyId);
  const pending = prescriptions.filter((p) => p.status === 'pending');
  const reviewed = prescriptions.filter((p) => p.status !== 'pending');
  const [rejecting, setRejecting] = useState(null);

  const review = (rx, decision, note) => {
    dispatch(prescriptionReviewed({ id: rx.id, decision, note }));
    toast(decision === 'approved' ? 'Simulated approval recorded' : 'Simulated rejection recorded', {
      tone: decision === 'approved' ? 'success' : 'warning',
      message: rx.owner === 'me' ? 'The patient’s cart updated instantly.' : rx.fileName,
    });
  };

  return (
    <div className="stack">
      <Alert tone="demo" title="Simulated pharmacist review">
        No real pharmacist reviews these files, and the file contents are never stored — only names and sizes. Approval here
        is a prototype action and does <strong>not</strong> authorise dispensing of any medicine.
      </Alert>
      {pending.length ? (
        pending.map((rx) => (
          <article key={rx.id} className="card card--pad rx-review">
            <div className="rx-review__file" aria-hidden="true">
              <FileCheck2 size={26} />
            </div>
            <div className="stack stack--sm" style={{ flex: 1, minWidth: 0 }}>
              <p className="fw-600" style={{ overflowWrap: 'anywhere' }}>
                {rx.fileName}
              </p>
              <p className="text-xs subtle">
                {rx.patientName} {rx.owner === 'me' ? '(your demo upload)' : '(sample patient)'} · {formatFileSize(rx.fileSize)} ·
                submitted {formatRelative(rx.submittedAt)}
              </p>
              <p className="text-sm">
                For: {rx.medicineIds.map((id) => getMedicineById(id)?.name).filter(Boolean).join(', ')}
              </p>
            </div>
            <div className="cluster">
              <Button
                size="sm"
                variant="primary"
                onClick={() => review(rx, 'approved', 'Simulated approval — prototype only, does not authorise dispensing.')}
              >
                Simulate approval
              </Button>
              <Button size="sm" variant="danger" onClick={() => setRejecting(rx)}>
                Simulate rejection
              </Button>
            </div>
          </article>
        ))
      ) : (
        <EmptyState icon={FileCheck2} title="Review queue is empty">
          Add a prescription-only product to the cart and upload a sample file to see it here.
        </EmptyState>
      )}

      {reviewed.length > 0 && (
        <section className="card card--pad stack" aria-labelledby="reviewed-heading">
          <h3 id="reviewed-heading">Recently reviewed</h3>
          <ul className="rx-list">
            {reviewed.map((rx) => (
              <li key={rx.id}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p className="text-sm fw-600" style={{ overflowWrap: 'anywhere' }}>
                    {rx.fileName}
                  </p>
                  <p className="text-xs subtle">
                    {rx.patientName} · reviewed {rx.reviewedAt ? formatDateTime(rx.reviewedAt) : '—'}
                    {rx.reviewNote ? ` · ${rx.reviewNote}` : ''}
                  </p>
                </div>
                <Badge tone={RX_STATUS_META[rx.status].tone}>{RX_STATUS_META[rx.status].label}</Badge>
              </li>
            ))}
          </ul>
        </section>
      )}

      <ReasonModal
        key={rejecting?.id ?? 'none'}
        open={Boolean(rejecting)}
        title="Reject prescription (simulated)?"
        description="The patient will be asked to upload another file or remove the prescription items."
        reasons={RX_REJECT_REASONS}
        confirmLabel="Simulate rejection"
        onCancel={() => setRejecting(null)}
        onConfirm={(reason) => {
          review(rejecting, 'rejected', `Simulated rejection — ${reason}`);
          setRejecting(null);
        }}
      />
    </div>
  );
}

function InventoryTable({ pharmacyId }) {
  const dispatch = useDispatch();
  const listings = useListings().filter((l) => l.pharmacyId === pharmacyId);
  const [query, setQuery] = useState('');
  const q = query.trim().toLowerCase();
  const rows = listings.filter((l) => !q || l.medicine.name.toLowerCase().includes(q));

  return (
    <div className="stack">
      <div className="input-group">
        <Search aria-hidden="true" />
        <label htmlFor="inventory-search" className="sr-only">
          Search inventory
        </label>
        <input id="inventory-search" className="input" type="search" placeholder="Search sample inventory" value={query} onChange={(e) => setQuery(e.target.value)} />
      </div>
      <div className="card table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th scope="col">Product</th>
              <th scope="col">Price</th>
              <th scope="col">Stock</th>
              <th scope="col">Status</th>
              <th scope="col">Listed</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((l) => (
              <tr key={l.key}>
                <td>
                  <span className="fw-600">{l.medicine.name}</span>
                  <span className="text-xs subtle" style={{ display: 'block' }}>
                    {l.medicine.packSize}
                    {l.medicine.rxRequired ? ' · Rx' : ''}
                  </span>
                </td>
                <td className="tabular">{formatCurrency(l.price)}</td>
                <td>
                  <QuantityStepper
                    value={l.stock}
                    min={0}
                    max={999}
                    label={l.medicine.name}
                    onChange={(stock) => dispatch(stockSet({ pharmacyId, medicineId: l.medicineId, stock }))}
                  />
                </td>
                <td>
                  <StockBadge listing={l} />
                </td>
                <td>
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={l.listed}
                      onChange={() => dispatch(listingToggled({ pharmacyId, medicineId: l.medicineId }))}
                      aria-label={`${l.medicine.name} available for ordering`}
                    />
                    <span className="switch__track" aria-hidden="true" />
                  </label>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs subtle">Stock changes apply instantly to the patient catalogue and cart validation in this browser.</p>
    </div>
  );
}

function OrdersTable({ orders, onReject }) {
  return (
    <div className="table-wrap">
      <table className="table">
        <thead>
          <tr>
            <th scope="col">Order ID</th>
            <th scope="col">Customer</th>
            <th scope="col">Items</th>
            <th scope="col">Total</th>
            <th scope="col">Status</th>
            <th scope="col">Action</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((o) => {
            const status = ORDER_STATUS[o.status];
            return (
              <tr key={o.id}>
                <td className="tabular">
                  <Link to={`/orders/${o.id}`} className="fw-600">
                    {o.ref}
                  </Link>
                  <span className="text-xs subtle" style={{ display: 'block' }}>
                    {formatRelative(o.createdAt)}
                  </span>
                </td>
                <td>
                  {o.address.name}
                  {o.owner === 'me' && <span className="text-xs subtle" style={{ display: 'block' }}>your demo order</span>}
                </td>
                <td>
                  {o.items.reduce((n, i) => n + i.qty, 0)} items
                  {o.requiresPrescription && <span className="badge badge--rx" style={{ marginLeft: 6 }}>Rx</span>}
                </td>
                <td className="tabular">{formatCurrency(o.total)}</td>
                <td>
                  <Badge tone={status.tone}>{status.label}</Badge>
                </td>
                <td>
                  <OrderActions order={o} onReject={onReject} compact />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

const TABS = ['overview', 'orders', 'prescriptions', 'inventory', 'history'];

export default function PharmacyDashboardPage() {
  useDocumentTitle('Pharmacy Dashboard');
  const [params, setParams] = useSearchParams();
  const pharmacy = getPharmacyById(params.get('pharmacy')) ?? PHARMACIES[0];
  const tab = TABS.includes(params.get('tab')) ? params.get('tab') : 'overview';
  const toast = useToast();
  const dispatch = useDispatch();
  const allOrders = useSelector(selectAllOrders);
  const orders = allOrders.filter((o) => o.pharmacyId === pharmacy.id);
  const prescriptions = useSelector(selectPrescriptions);
  const listings = useListings().filter((l) => l.pharmacyId === pharmacy.id);
  const [rejectingOrder, setRejectingOrder] = useState(null);

  const active = orders.filter(isActiveOrder);
  const history = orders.filter((o) => !isActiveOrder(o));
  const pendingRx = prescriptions.filter((p) => p.pharmacyId === pharmacy.id && p.status === 'pending');
  const lowStock = listings.filter((l) => l.stock <= 5).length;

  const linkFor = (t) => {
    const next = new URLSearchParams(params);
    next.set('tab', t);
    return `/dashboard/pharmacy?${next}`;
  };
  const setPharmacy = (id) => {
    const next = new URLSearchParams(params);
    next.set('pharmacy', id);
    setParams(next, { replace: true });
  };

  // Pharmacies with pending work are flagged in the selector so demo orders are easy to find.
  const pharmacyOptions = PHARMACIES.map((p) => {
    const work =
      prescriptions.filter((rx) => rx.pharmacyId === p.id && rx.status === 'pending').length +
      allOrders.filter((o) => o.pharmacyId === p.id && isActiveOrder(o)).length;
    return [p.id, `${p.name} — ${p.city}${work ? ` (${work} to action)` : ''}`];
  });

  const emptyOrders = (
    <EmptyState icon={PackageOpen} title="No active orders" actions={<Button to={`/medicines?pharmacy=${pharmacy.id}`}>Place a demo order</Button>}>
      Orders placed with {pharmacy.name} will appear here instantly.
    </EmptyState>
  );

  return (
    <DashboardShell
      label="Pharmacy dashboard"
      identity={
        <>
          <PharmacyLogo pharmacy={pharmacy} size={40} />
          <div>
            <p>Pharmacy Dashboard</p>
            <span>Demo console</span>
          </div>
        </>
      }
      items={[
        { key: 'overview', to: linkFor('overview'), label: 'Overview', icon: LayoutDashboard, active: tab === 'overview' },
        { key: 'inventory', to: linkFor('inventory'), label: 'Inventory', icon: Boxes, active: tab === 'inventory' },
        { key: 'orders', to: linkFor('orders'), label: 'Incoming Orders', icon: ClipboardList, active: tab === 'orders', count: active.length },
        { key: 'prescriptions', to: linkFor('prescriptions'), label: 'Prescription Review', icon: FileCheck2, active: tab === 'prescriptions', count: pendingRx.length },
        { key: 'history', to: linkFor('history'), label: 'Order History', icon: History, active: tab === 'history' },
      ]}
      footer={
        <Link to="/dashboard/provider" className="dash__link">
          <Building2 size={17} aria-hidden="true" />
          <span>Hospital dashboard</span>
        </Link>
      }
    >
      <header className="dash-header dash-header--row">
        <div className="cluster" style={{ gap: 14 }}>
          <PharmacyLogo pharmacy={pharmacy} size={52} />
          <div>
            <p className="eyebrow-text">Pharmacy Dashboard</p>
            <h1>{pharmacy.name}</h1>
            <p className="text-sm muted">
              {pharmacy.area}, {pharmacy.city} · {pharmacy.delivery.available ? 'Delivery available (demo)' : 'Pickup only'}
            </p>
          </div>
        </div>
        <div className="cluster" style={{ alignItems: 'flex-end' }}>
          <FilterSelect id="pharmacy-select" label="Pharmacy" value={pharmacy.id} onChange={setPharmacy} options={pharmacyOptions} />
          <DemoBadge>Demo console</DemoBadge>
        </div>
      </header>

      <Alert tone="demo">
        Every action here is simulated. Nothing is dispensed or delivered, and changes stay in this browser (other open tabs
        update automatically).
      </Alert>

      {tab === 'overview' && (
        <>
          <div className="grid grid--4">
            <StatTile icon={Store} label="Products" value={listings.length} to={linkFor('inventory')} />
            <StatTile icon={ClipboardList} label="Pending Orders" value={active.length} to={linkFor('orders')} />
            <StatTile icon={FileCheck2} label="Prescription Review" value={pendingRx.length} to={linkFor('prescriptions')} />
            <StatTile icon={Boxes} label="Low or out of stock" value={lowStock} to={linkFor('inventory')} />
          </div>
          <section className="panel" aria-labelledby="incoming-heading">
            <div className="panel__head">
              <h2 id="incoming-heading">Incoming Orders</h2>
              <Link to={linkFor('orders')} className="text-sm fw-600">
                View All
              </Link>
            </div>
            {active.length ? <OrdersTable orders={active} onReject={setRejectingOrder} /> : emptyOrders}
          </section>
        </>
      )}
      {tab === 'orders' && (active.length ? active.map((o) => <OrderPanel key={o.id} order={o} onReject={setRejectingOrder} />) : emptyOrders)}
      {tab === 'prescriptions' && <PrescriptionQueue pharmacyId={pharmacy.id} />}
      {tab === 'inventory' && <InventoryTable pharmacyId={pharmacy.id} />}
      {tab === 'history' &&
        (history.length ? (
          <section className="panel">
            <OrdersTable orders={history} onReject={setRejectingOrder} />
          </section>
        ) : (
          <EmptyState icon={History} title="No completed orders yet">
            Delivered, rejected and cancelled orders will be listed here.
          </EmptyState>
        ))}

      <ReasonModal
        key={rejectingOrder?.id ?? 'none'}
        open={Boolean(rejectingOrder)}
        title={`Reject order ${rejectingOrder?.ref ?? ''}?`}
        description="Reserved stock will be released and the patient will see the reason on their tracking page."
        reasons={REJECT_REASONS}
        confirmLabel="Reject order"
        onCancel={() => setRejectingOrder(null)}
        onConfirm={(reason) => {
          const result = dispatch(changeOrderStatus({ id: rejectingOrder.id, status: 'rejected', actor: 'pharmacy', note: reason }));
          if (result.ok) toast(`${rejectingOrder.ref} rejected (simulated)`, { tone: 'warning', message: reason });
          setRejectingOrder(null);
        }}
      />
    </DashboardShell>
  );
}
