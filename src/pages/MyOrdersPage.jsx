import { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { ClipboardList, Pill } from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';
import AccountShell from '../components/layout/AccountShell';
import Button from '../components/ui/Button';
import EmptyState from '../components/ui/EmptyState';
import Tabs from '../components/ui/Tabs';
import PrescriptionList from '../components/domain/PrescriptionList';
import OrderCard from '../components/domain/OrderCard';
import { selectAllOrders } from '../features/orders/ordersSlice';
import { selectPrescriptions } from '../features/prescriptions/prescriptionsSlice';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { isActiveOrder } from '../utils/orderStatus';

export default function MyOrdersPage() {
  useDocumentTitle('My Orders');
  const orders = useSelector(selectAllOrders);
  const prescriptions = useSelector(selectPrescriptions);
  const [tab, setTab] = useState('active');

  const groups = useMemo(() => {
    const mine = orders.filter((o) => o.owner === 'me');
    return {
      active: mine.filter(isActiveOrder),
      delivered: mine.filter((o) => o.status === 'delivered'),
      closed: mine.filter((o) => o.status === 'rejected' || o.status === 'cancelled'),
    };
  }, [orders]);
  const myPrescriptions = prescriptions.filter((p) => p.owner === 'me');

  return (
    <AccountShell>
      <PageHeader
        eyebrow="Pharmacy orders"
        eyebrowIcon={ClipboardList}
        title="My orders"
        description="Demo medicine orders saved in this browser. Not connected to any pharmacy or courier."
        actions={
          <Button to="/medicines" variant="primary" icon={Pill}>
            Order medicines
          </Button>
        }
      />
      <div className="stack">
        <Tabs
          label="Order groups"
          value={tab}
          onChange={setTab}
          tabs={[
            { value: 'active', label: 'In progress', count: groups.active.length },
            { value: 'delivered', label: 'Delivered', count: groups.delivered.length },
            { value: 'closed', label: 'Cancelled / rejected', count: groups.closed.length },
          ]}
        />
        <div role="tabpanel" className="stack">
          {groups[tab].length ? (
            groups[tab].map((o) => <OrderCard key={o.id} order={o} />)
          ) : (
            <EmptyState
              icon={ClipboardList}
              title={tab === 'active' ? 'No orders in progress' : 'Nothing here yet'}
              actions={<Button to="/medicines" variant="primary">Browse catalogue</Button>}
            >
              Orders you place in the demo will appear here with their simulated status.
            </EmptyState>
          )}
        </div>

        {myPrescriptions.length > 0 && (
          <section className="card card--pad stack section" aria-labelledby="rx-heading">
            <h2 id="rx-heading" className="card-title">
              Prescription reviews
            </h2>
            <p className="text-sm muted">Files are never uploaded — only the file name is kept to demonstrate the review flow.</p>
            <PrescriptionList prescriptions={myPrescriptions} />
          </section>
        )}
      </div>
    </AccountShell>
  );
}
