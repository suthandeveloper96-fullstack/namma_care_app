import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { CalendarCheck, CalendarPlus, ClipboardList, FileClock, Pill, Store } from 'lucide-react';
import Alert from '../components/ui/Alert';
import Badge from '../components/ui/Badge';
import StatTile from '../components/ui/StatTile';
import AccountShell from '../components/layout/AccountShell';
import { ProductArt } from '../components/brand/Illustrations';
import DoctorPhoto from '../components/domain/DoctorPhoto';
import PrescriptionList from '../components/domain/PrescriptionList';
import { getDoctorById } from '../data/doctors';
import { getHospitalById } from '../data/hospitals';
import { getMedicineById } from '../data/medicines';
import { getSpecialtyById } from '../data/specialties';
import { selectAllAppointments } from '../features/appointments/appointmentsSlice';
import { selectAllOrders } from '../features/orders/ordersSlice';
import { selectPrescriptions } from '../features/prescriptions/prescriptionsSlice';
import { selectProfile } from '../features/profile/profileSlice';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { useNow } from '../hooks/useNow';
import { groupAppointments } from '../utils/booking';
import { formatDateShort, formatDateTime, formatTime } from '../utils/format';
import { ORDER_STATUS, isActiveOrder } from '../utils/orderStatus';

const QUICK_ACTIONS = [
  { to: '/book', icon: CalendarPlus, title: 'Book Appointment', text: 'Find a doctor' },
  { to: '/medicines', icon: Pill, title: 'Order Medicines', text: 'From a nearby pharmacy' },
  { to: '/pharmacies', icon: Store, title: 'Find Pharmacy', text: 'Open now near you' },
];

function greeting(now) {
  const h = now.getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function ProfilePage() {
  useDocumentTitle('Patient Dashboard');
  const now = useNow();
  const profile = useSelector(selectProfile);
  const appointments = useSelector(selectAllAppointments);
  const orders = useSelector(selectAllOrders);
  const prescriptions = useSelector(selectPrescriptions);

  const groups = useMemo(() => groupAppointments(appointments, now), [appointments, now]);
  const myOrders = orders.filter((o) => o.owner === 'me');
  const activeOrders = myOrders.filter(isActiveOrder);
  const myRx = prescriptions.filter((p) => p.owner === 'me');
  const pendingRx = myRx.filter((p) => p.status === 'pending');
  const firstName = profile.name.split(' ')[0] || 'there';

  return (
    <AccountShell>
      <header className="dash-header">
        <p className="eyebrow-text">Patient Dashboard</p>
        <h1>
          {greeting(now)}, {firstName}!
        </h1>
        <p className="text-sm muted">Here’s your demo health summary — stored only in this browser.</p>
      </header>

      <div className="quick-actions">
        {QUICK_ACTIONS.map(({ to, icon: Icon, title, text }) => (
          <Link key={to} to={to} className="quick-action">
            <span className="icon-tile">
              <Icon aria-hidden="true" />
            </span>
            <span>
              <strong>{title}</strong>
              <span>{text}</span>
            </span>
          </Link>
        ))}
      </div>

      <div className="grid grid--4">
        <StatTile icon={CalendarCheck} label="Upcoming visits" value={groups.upcoming.length} to="/appointments" />
        <StatTile icon={ClipboardList} label="Orders in progress" value={activeOrders.length} to="/orders" />
        <StatTile icon={FileClock} label="Rx pending review" value={pendingRx.length} to="/orders" />
        <StatTile icon={CalendarPlus} label="Past & cancelled" value={groups.past.length + groups.cancelled.length} to="/appointments" />
      </div>

      <div className="grid grid--2" style={{ alignItems: 'start' }}>
        <section className="panel" aria-labelledby="upcoming-heading">
          <div className="panel__head">
            <h2 id="upcoming-heading">Upcoming Appointments</h2>
            <Link to="/appointments" className="text-sm fw-600">
              View All
            </Link>
          </div>
          {groups.upcoming.length ? (
            <ul className="mini-list">
              {groups.upcoming.slice(0, 3).map((a) => {
                const doctor = getDoctorById(a.doctorId);
                return (
                  <li key={a.id}>
                    <DoctorPhoto doctor={doctor} size={44} />
                    <div className="mini-list__body">
                      <Link to={`/appointments/${a.id}`} className="fw-600">
                        {doctor.name}
                      </Link>
                      <span className="text-xs subtle">
                        {getSpecialtyById(doctor.specialtyId).name} · {getHospitalById(a.hospitalId).name}
                      </span>
                      <span className="text-xs subtle">
                        {formatDateShort(a.date)} · {formatTime(a.time)}
                      </span>
                    </div>
                    <Badge tone="success">Booked (demo)</Badge>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="muted text-sm">
              No upcoming demo appointments. <Link to="/doctors">Find a doctor</Link>.
            </p>
          )}
        </section>

        <section className="panel" aria-labelledby="orders-heading">
          <div className="panel__head">
            <h2 id="orders-heading">Recent Orders</h2>
            <Link to="/orders" className="text-sm fw-600">
              View All
            </Link>
          </div>
          {myOrders.length ? (
            <ul className="mini-list">
              {myOrders.slice(0, 4).map((o) => {
                const first = getMedicineById(o.items[0].medicineId);
                const status = ORDER_STATUS[o.status];
                return (
                  <li key={o.id}>
                    <span className="mini-list__art">{first && <ProductArt medicine={first} size={36} />}</span>
                    <div className="mini-list__body">
                      <Link to={`/orders/${o.id}`} className="fw-600">
                        {o.items[0].name}
                        {o.items.length > 1 ? ` +${o.items.length - 1} more` : ''}
                      </Link>
                      <span className="text-xs subtle">{formatDateTime(o.createdAt)}</span>
                    </div>
                    <Badge tone={status.tone}>{status.label}</Badge>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="muted text-sm">
              No demo orders yet. <Link to="/medicines">Browse the catalogue</Link>.
            </p>
          )}
        </section>
      </div>

      {myRx.length > 0 && (
        <section className="panel stack" aria-labelledby="rx-heading">
          <h2 id="rx-heading" className="panel__title">
            Prescription reviews
          </h2>
          {pendingRx.length > 0 && (
            <Alert tone="warning">
              {pendingRx.length} prescription{pendingRx.length > 1 ? 's are' : ' is'} awaiting a simulated pharmacist review.
              Review it from your <Link to="/cart">cart</Link> or the{' '}
              <Link to="/dashboard/pharmacy?tab=prescriptions">pharmacy dashboard</Link>.
            </Alert>
          )}
          <PrescriptionList prescriptions={myRx} />
        </section>
      )}

      <Alert tone="warning" title="Emergency?">
        Call 108 (ambulance) or 112. NammaCare is a demo and cannot help in emergencies.
      </Alert>
    </AccountShell>
  );
}
