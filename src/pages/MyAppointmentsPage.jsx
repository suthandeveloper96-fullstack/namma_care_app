import { useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { CalendarCheck, CalendarPlus, CalendarX } from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';
import AccountShell from '../components/layout/AccountShell';
import Button from '../components/ui/Button';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import EmptyState from '../components/ui/EmptyState';
import Tabs from '../components/ui/Tabs';
import AppointmentCard from '../components/domain/AppointmentCard';
import { getDoctorById } from '../data/doctors';
import { selectAllAppointments } from '../features/appointments/appointmentsSlice';
import { cancelAppointment } from '../features/appointments/appointmentThunks';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { useNow } from '../hooks/useNow';
import { useToast } from '../hooks/useToast';
import { groupAppointments } from '../utils/booking';
import { formatDateShort, formatTime } from '../utils/format';

const EMPTY_COPY = {
  upcoming: ['No upcoming appointments', 'Find a doctor and book an open demo slot.'],
  past: ['No past appointments', 'Completed or missed demo visits will appear here.'],
  cancelled: ['No cancelled appointments', 'Appointments you cancel will be listed here.'],
};

export default function MyAppointmentsPage() {
  useDocumentTitle('My Appointments');
  const dispatch = useDispatch();
  const toast = useToast();
  const now = useNow();
  const appointments = useSelector(selectAllAppointments);
  const [tab, setTab] = useState('upcoming');
  const [toCancel, setToCancel] = useState(null);
  const groups = useMemo(() => groupAppointments(appointments, now), [appointments, now]);
  const list = groups[tab];

  const confirmCancel = () => {
    const result = dispatch(cancelAppointment(toCancel.id));
    setToCancel(null);
    if (result.ok) toast('Demo appointment cancelled', { tone: 'info', message: 'The slot is open again.' });
    else toast('Could not cancel', { tone: 'danger', message: result.error });
  };

  return (
    <AccountShell>
      <PageHeader
        eyebrow="Your visits"
        eyebrowIcon={CalendarCheck}
        title="My appointments"
        description="Demo bookings saved in this browser. They are not shared with any hospital."
        actions={
          <Button to="/book" variant="primary" icon={CalendarPlus}>
            Book appointment
          </Button>
        }
      />
      <div className="stack">
        <Tabs
          label="Appointment groups"
          value={tab}
          onChange={setTab}
          tabs={[
            { value: 'upcoming', label: 'Upcoming', count: groups.upcoming.length },
            { value: 'past', label: 'Past', count: groups.past.length },
            { value: 'cancelled', label: 'Cancelled', count: groups.cancelled.length },
          ]}
        />
        <div role="tabpanel" aria-label={tab} className="stack">
          {list.length ? (
            list.map((a) => <AppointmentCard key={a.id} appointment={a} now={now} onCancel={setToCancel} />)
          ) : (
            <EmptyState
              icon={tab === 'cancelled' ? CalendarX : CalendarCheck}
              title={EMPTY_COPY[tab][0]}
              actions={<Button to="/doctors" variant="primary">Find doctors</Button>}
            >
              {EMPTY_COPY[tab][1]}
            </EmptyState>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={Boolean(toCancel)}
        title="Cancel this demo appointment?"
        tone="danger"
        confirmLabel="Cancel appointment"
        cancelLabel="Keep appointment"
        onCancel={() => setToCancel(null)}
        onConfirm={confirmCancel}
      >
        {toCancel &&
          `${getDoctorById(toCancel.doctorId)?.name} on ${formatDateShort(toCancel.date)} at ${formatTime(toCancel.time)} will be cancelled and the slot released.`}
      </ConfirmDialog>
    </AccountShell>
  );
}
