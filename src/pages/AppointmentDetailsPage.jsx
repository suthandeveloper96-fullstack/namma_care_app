import { useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { CalendarCheck, CalendarX, CircleCheckBig, FlaskConical } from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';
import Alert from '../components/ui/Alert';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import { ErrorState } from '../components/ui/EmptyState';
import { DoctorStatusBadge, StatusTimestamp } from '../components/domain/DoctorStatus';
import { getDoctorById } from '../data/doctors';
import { getHospitalById } from '../data/hospitals';
import { getSpecialtyById } from '../data/specialties';
import { selectAppointmentById } from '../features/appointments/appointmentsSlice';
import { cancelAppointment } from '../features/appointments/appointmentThunks';
import { selectStatusById } from '../features/doctorStatus/doctorStatusSlice';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { useNow } from '../hooks/useNow';
import { useToast } from '../hooks/useToast';
import { APPOINTMENT_STATUS, canCancelAppointment } from '../utils/booking';
import { resolveDoctorStatus } from '../utils/doctorStatus';
import { formatCurrency, formatDateShort, formatDateTime, formatTime } from '../utils/format';
import { maskPhone } from '../utils/text';

export default function AppointmentDetailsPage() {
  const { appointmentId } = useParams();
  const [params] = useSearchParams();
  const dispatch = useDispatch();
  const toast = useToast();
  const now = useNow();
  const appointment = useSelector(selectAppointmentById(appointmentId));
  const statusById = useSelector(selectStatusById);
  const [confirmOpen, setConfirmOpen] = useState(false);
  useDocumentTitle(appointment ? `Appointment ${appointment.ref}` : 'Appointment not found');

  if (!appointment) {
    return (
      <div className="container page">
        <ErrorState
          title="Appointment not found"
          actions={
            <>
              <Button to="/appointments" variant="primary">My appointments</Button>
              <Button to="/doctors">Find doctors</Button>
            </>
          }
        >
          It may have been removed when demo data was reset, or the link is incorrect.
        </ErrorState>
      </div>
    );
  }

  const doctor = getDoctorById(appointment.doctorId);
  const hospital = getHospitalById(appointment.hospitalId);
  const status = APPOINTMENT_STATUS[appointment.status];
  const doctorStatus = resolveDoctorStatus(statusById[doctor.id], now.getTime());
  const isNew = params.get('new') === '1' && appointment.status === 'booked';
  const cancellable = canCancelAppointment(appointment, now);

  const onCancel = () => {
    const result = dispatch(cancelAppointment(appointment.id));
    setConfirmOpen(false);
    if (result.ok) toast('Demo appointment cancelled', { tone: 'info', message: 'The slot is open again.' });
    else toast('Could not cancel', { tone: 'danger', message: result.error });
  };

  return (
    <div className="container page narrow">
      <PageHeader
        breadcrumbs={[{ label: 'Home', to: '/' }, { label: 'My appointments', to: '/appointments' }, { label: appointment.ref }]}
        eyebrow="Appointment"
        eyebrowIcon={CalendarCheck}
        title={isNew ? 'Demo appointment confirmed' : 'Appointment details'}
        actions={<Badge tone={status.tone}>{status.label}</Badge>}
      />

      {isNew && (
        <div className="confirmation-hero card card--tint">
          <CircleCheckBig size={40} aria-hidden="true" />
          <div>
            <p className="fw-600">Your simulated booking is saved in this browser.</p>
            <p className="text-sm muted">
              Demo reference <strong className="tabular">{appointment.ref}</strong>
            </p>
          </div>
        </div>
      )}

      <Alert tone="demo" icon={FlaskConical} title="Not a real booking" className="mb-6">
        This appointment has not been sent to {hospital.name} or {doctor.name}. Both are fictional, and no confirmation
        SMS or call will follow.
      </Alert>

      <div className="grid grid--2" style={{ alignItems: 'start' }}>
        <section className="card card--pad-lg stack" aria-labelledby="appt-heading">
          <h2 id="appt-heading" className="card-title">
            Booking summary
          </h2>
          <dl className="dl">
            <dt>Reference</dt>
            <dd className="tabular">{appointment.ref}</dd>
            <dt>Doctor</dt>
            <dd>
              <Link to={`/doctors/${doctor.id}`}>{doctor.name}</Link>
            </dd>
            <dt>Specialty</dt>
            <dd>{getSpecialtyById(doctor.specialtyId).name}</dd>
            <dt>{hospital.type}</dt>
            <dd>
              <Link to={`/hospitals/${hospital.id}`}>{hospital.name}</Link>
              <span className="subtle text-xs" style={{ display: 'block' }}>
                {hospital.address}, {hospital.city}
              </span>
            </dd>
            <dt>Date</dt>
            <dd>{formatDateShort(appointment.date)}</dd>
            <dt>Time</dt>
            <dd>{formatTime(appointment.time)}</dd>
            <dt>Patient</dt>
            <dd>
              {appointment.patient.name}, {appointment.patient.age} yrs
            </dd>
            <dt>Mobile</dt>
            <dd>{maskPhone(appointment.patient.phone)}</dd>
            {appointment.reason && (
              <>
                <dt>Reason</dt>
                <dd>{appointment.reason}</dd>
              </>
            )}
            <dt>Fee</dt>
            <dd>{formatCurrency(doctor.fee)} at the clinic (demo)</dd>
            <dt>Booked</dt>
            <dd>{formatDateTime(appointment.createdAt)}</dd>
          </dl>
          <div className="cluster">
            {cancellable && (
              <Button variant="danger" icon={CalendarX} onClick={() => setConfirmOpen(true)}>
                Cancel appointment
              </Button>
            )}
            <Button to="/appointments">All appointments</Button>
          </div>
        </section>

        <aside className="stack">
          <section className="card card--pad stack" aria-labelledby="doc-status-heading">
            <h2 id="doc-status-heading" className="card-title">
              Doctor’s latest demo status
            </h2>
            <DoctorStatusBadge status={doctorStatus} />
            <StatusTimestamp status={doctorStatus} now={now} />
            <p className="text-sm muted">Check this again before you leave. Statuses here are simulated and can be changed from the provider dashboard.</p>
          </section>
          <section className="card card--pad stack">
            <h2 className="card-title">What’s next</h2>
            <ul className="check-list">
              <li>Arrive 15 minutes early with a photo ID.</li>
              <li>Carry previous prescriptions or reports.</li>
              <li>For emergencies, call 108 / 112 — don’t wait for this appointment.</li>
            </ul>
            <Button to="/medicines" variant="secondary">
              Browse pharmacy essentials
            </Button>
          </section>
        </aside>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        title="Cancel this demo appointment?"
        tone="danger"
        confirmLabel="Cancel appointment"
        cancelLabel="Keep appointment"
        onCancel={() => setConfirmOpen(false)}
        onConfirm={onCancel}
      >
        {doctor.name} on {formatDateShort(appointment.date)} at {formatTime(appointment.time)} will be cancelled and the
        slot released.
      </ConfirmDialog>
    </div>
  );
}
