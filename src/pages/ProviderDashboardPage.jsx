import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Building2, CalendarCheck, CalendarClock, LayoutDashboard, RefreshCw, Stethoscope, UserCheck, Users } from 'lucide-react';
import Alert from '../components/ui/Alert';
import Badge, { DemoBadge } from '../components/ui/Badge';
import Button from '../components/ui/Button';
import EmptyState from '../components/ui/EmptyState';
import FilterSelect from '../components/ui/FilterSelect';
import Modal from '../components/ui/Modal';
import StatTile from '../components/ui/StatTile';
import DashboardShell from '../components/layout/DashboardShell';
import DoctorPhoto from '../components/domain/DoctorPhoto';
import { DoctorStatusBadge, StatusTimestamp } from '../components/domain/DoctorStatus';
import { getDoctorById, getDoctorsByHospital } from '../data/doctors';
import { HOSPITALS, getHospitalById } from '../data/hospitals';
import { appointmentStatusChanged, selectAllAppointments } from '../features/appointments/appointmentsSlice';
import { demoStatusesRefreshed, doctorStatusUpdated, selectStatusById } from '../features/doctorStatus/doctorStatusSlice';
import { selectLocation } from '../features/profile/profileSlice';
import { summarizeStatuses, useDoctorViews } from '../hooks/useDoctorViews';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { useNow } from '../hooks/useNow';
import { useToast } from '../hooks/useToast';
import { APPOINTMENT_STATUS, appointmentDate } from '../utils/booking';
import { toDateKey } from '../utils/date';
import { DELAY_OPTIONS, DOCTOR_STATUSES, SETTABLE_STATUSES } from '../utils/doctorStatus';
import { formatDayLabel, formatDistance, formatTime } from '../utils/format';
import { distanceKm } from '../utils/geo';
import { maskPhone } from '../utils/text';

const ACTION_LABELS = {
  available: 'Mark Available',
  with_patient: 'Mark With Patient',
  delayed: 'Mark Delayed',
  away: 'Mark Away',
  offline: 'Mark Offline',
};
const TABS = ['overview', 'doctors', 'appointments'];

/** Status buttons + delay selector + timestamp refresh for one doctor. */
function StatusControls({ view }) {
  const dispatch = useDispatch();
  const toast = useToast();
  const entry = useSelector(selectStatusById)[view.id];
  const [delay, setDelay] = useState(String(entry?.delayMinutes || 15));

  const setStatus = (status) => {
    dispatch(doctorStatusUpdated({ doctorId: view.id, status, delayMinutes: Number(delay) }));
    toast(`${view.doctor.name}: ${DOCTOR_STATUSES[status].label}`, {
      tone: 'info',
      message: status === 'delayed' ? `Delay set to ~${delay} min. Patient pages updated.` : 'Patient pages updated instantly.',
    });
  };

  const refreshTimestamp = () => {
    if (!entry) return;
    dispatch(doctorStatusUpdated({ doctorId: view.id, status: entry.status, delayMinutes: entry.delayMinutes }));
    toast('Status timestamp updated', { tone: 'info', message: `${view.doctor.name} — confirmed as current.` });
  };

  return (
    <div className="provider-row__controls" role="group" aria-label={`Update status for ${view.doctor.name}`}>
      {SETTABLE_STATUSES.map((status) => (
        <button
          key={status}
          type="button"
          className={`chip status-action status-action--${status}`}
          aria-pressed={!view.status.stale && view.status.key === status}
          onClick={() => setStatus(status)}
        >
          {ACTION_LABELS[status]}
        </button>
      ))}
      <label className="delay-select">
        <span className="text-xs subtle">Delay</span>
        <select className="select" value={delay} onChange={(e) => setDelay(e.target.value)} aria-label={`Delay duration for ${view.doctor.name}`}>
          {DELAY_OPTIONS.map((m) => (
            <option key={m} value={m}>
              {m} min
            </option>
          ))}
        </select>
      </label>
      <Button size="sm" variant="ghost" icon={RefreshCw} onClick={refreshTimestamp} title="Re-confirm the current status with a new timestamp">
        Update timestamp
      </Button>
    </div>
  );
}

function DoctorIdentity({ view }) {
  return (
    <div className="provider-row__who">
      <DoctorPhoto doctor={view.doctor} size={40} />
      <div>
        <Link to={`/doctors/${view.id}`} className="fw-600">
          {view.doctor.name}
        </Link>
        <p className="text-xs subtle">{view.specialty.name}</p>
      </div>
    </div>
  );
}

function AppointmentsTable({ appointments, now, onStatus }) {
  if (!appointments.length) {
    return (
      <EmptyState icon={CalendarClock} title="No appointments to show">
        Book a demo appointment at this facility and it will appear here instantly.
      </EmptyState>
    );
  }
  return (
    <div className="table-wrap">
      <table className="table">
        <thead>
          <tr>
            <th scope="col">When</th>
            <th scope="col">Doctor</th>
            <th scope="col">Patient</th>
            <th scope="col">Reference</th>
            <th scope="col">Status</th>
            <th scope="col">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {appointments.map((a) => {
            const status = APPOINTMENT_STATUS[a.status];
            return (
              <tr key={a.id}>
                <td className="nowrap">
                  <strong>{formatDayLabel(a.date, now)}</strong>
                  <span className="subtle"> · {formatTime(a.time)}</span>
                </td>
                <td>{getDoctorById(a.doctorId)?.name}</td>
                <td>
                  {a.patient.name}
                  <span className="text-xs subtle" style={{ display: 'block' }}>
                    {a.patient.age} yrs · {maskPhone(a.patient.phone)} {a.owner === 'me' ? '· your demo booking' : ''}
                  </span>
                </td>
                <td className="tabular text-xs">{a.ref}</td>
                <td>
                  <Badge tone={status.tone}>{status.label}</Badge>
                </td>
                <td>
                  {a.status === 'booked' && (
                    <div className="cluster" style={{ flexWrap: 'nowrap' }}>
                      <Button size="sm" variant="secondary" onClick={() => onStatus(a, 'completed')}>
                        Complete
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => onStatus(a, 'no_show')}>
                        Missed
                      </Button>
                      <Button size="sm" variant="danger" onClick={() => onStatus(a, 'cancelled')}>
                        Cancel
                      </Button>
                    </div>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default function ProviderDashboardPage() {
  useDocumentTitle('Hospital Dashboard');
  const dispatch = useDispatch();
  const toast = useToast();
  const now = useNow();
  const [params, setParams] = useSearchParams();
  const hospital = getHospitalById(params.get('hospital')) ?? HOSPITALS[0];
  const tab = TABS.includes(params.get('tab')) ? params.get('tab') : 'overview';
  const origin = useSelector(selectLocation);
  const doctors = useMemo(() => getDoctorsByHospital(hospital.id), [hospital.id]);
  const views = useDoctorViews(now, { doctors });
  const summary = summarizeStatuses(views);
  const appointments = useSelector(selectAllAppointments);
  const [doctorFilter, setDoctorFilter] = useState('');
  const [showPast, setShowPast] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const editing = views.find((v) => v.id === editingId);

  const setParam = (key, value) => {
    const next = new URLSearchParams(params);
    next.set(key, value);
    setParams(next, { replace: true });
  };
  const linkFor = (t) => {
    const next = new URLSearchParams(params);
    next.set('tab', t);
    return `/dashboard/provider?${next}`;
  };

  const ofHospital = appointments.filter((a) => a.hospitalId === hospital.id);
  const todayKey = toDateKey(now);
  const todayCount = ofHospital.filter((a) => a.date === todayKey && a.status === 'booked').length;
  const upcoming = ofHospital
    .filter((a) => a.status === 'booked' && appointmentDate(a) > new Date(now.getTime() - 60 * 60000))
    .sort((a, b) => appointmentDate(a) - appointmentDate(b));
  const tableRows = (showPast ? [...ofHospital].sort((a, b) => appointmentDate(a) - appointmentDate(b)) : upcoming).filter(
    (a) => !doctorFilter || a.doctorId === doctorFilter,
  );

  const setAppointmentStatus = (appointment, status) => {
    dispatch(appointmentStatusChanged({ id: appointment.id, status, actor: 'provider' }));
    toast(`Appointment ${APPOINTMENT_STATUS[status].label.toLowerCase()}`, { tone: 'info', message: appointment.ref });
  };

  return (
    <DashboardShell
      label="Hospital dashboard"
      identity={
        <>
          <span className="icon-tile">
            <Building2 aria-hidden="true" />
          </span>
          <div>
            <p>Hospital Dashboard</p>
            <span>Demo console</span>
          </div>
        </>
      }
      items={[
        { key: 'overview', to: linkFor('overview'), label: 'Overview', icon: LayoutDashboard, active: tab === 'overview' },
        { key: 'doctors', to: linkFor('doctors'), label: 'Doctors & Availability', icon: Stethoscope, active: tab === 'doctors' },
        { key: 'appointments', to: linkFor('appointments'), label: 'Appointments', icon: CalendarClock, active: tab === 'appointments', count: upcoming.length },
      ]}
      footer={
        <Link to="/dashboard/pharmacy" className="dash__link">
          <Building2 size={17} aria-hidden="true" />
          <span>Pharmacy dashboard</span>
        </Link>
      }
    >
      <header className="dash-header dash-header--row">
        <div>
          <p className="eyebrow-text">Hospital / Doctor Dashboard</p>
          <h1>{hospital.name}</h1>
          <p className="text-sm muted">
            Demo {hospital.type.toLowerCase()} · {hospital.area}, {hospital.city} · {formatDistance(distanceKm(origin, hospital))}
          </p>
        </div>
        <div className="cluster" style={{ alignItems: 'flex-end' }}>
          <FilterSelect
            id="facility"
            label="Facility"
            value={hospital.id}
            onChange={(v) => {
              setDoctorFilter('');
              setParam('hospital', v);
            }}
            options={HOSPITALS.map((h) => [h.id, `${h.name} — ${h.city}`])}
          />
          <DemoBadge>Demo console</DemoBadge>
        </div>
      </header>

      <Alert tone="demo">
        Changes here update the patient pages immediately in this browser (including other open tabs). They are{' '}
        <strong>not</strong> synced to other users or devices, and no real hospital is connected.
      </Alert>

      {tab === 'overview' && (
        <>
          <div className="grid grid--4">
            <StatTile icon={Users} label="Doctors" value={summary.total} />
            <StatTile icon={CalendarCheck} label="Today’s Appointments" value={todayCount} />
            <StatTile icon={UserCheck} label="Available Now" value={summary.available} />
            <StatTile icon={CalendarClock} label="Upcoming bookings" value={upcoming.length} />
          </div>
          <section className="panel" aria-labelledby="availability-heading">
            <div className="panel__head">
              <h2 id="availability-heading">Doctor Availability</h2>
              <Button
                size="sm"
                variant="ghost"
                icon={RefreshCw}
                onClick={() => {
                  dispatch(demoStatusesRefreshed());
                  toast('Sample statuses re-stamped', { tone: 'info', message: 'All doctors show their original demo status as freshly updated.' });
                }}
              >
                Reset sample statuses
              </Button>
            </div>
            <ul className="availability-table">
              {views.map((v) => (
                <li key={v.id}>
                  <DoctorIdentity view={v} />
                  <div className="availability-table__status">
                    <DoctorStatusBadge status={v.status} />
                    <StatusTimestamp status={v.status} now={now} />
                  </div>
                  <Button size="sm" variant="outline" onClick={() => setEditingId(v.id)} aria-label={`Update status for ${v.doctor.name}`}>
                    Update
                  </Button>
                </li>
              ))}
            </ul>
          </section>
          <section className="panel" aria-labelledby="next-heading">
            <div className="panel__head">
              <h2 id="next-heading">Next appointments</h2>
              <Link to={linkFor('appointments')} className="text-sm fw-600">
                View All
              </Link>
            </div>
            <AppointmentsTable appointments={upcoming.slice(0, 5)} now={now} onStatus={setAppointmentStatus} />
          </section>
        </>
      )}

      {tab === 'doctors' && (
        <section className="panel panel--flush" aria-labelledby="doctors-heading">
          <div className="panel__head panel__head--pad">
            <h2 id="doctors-heading">Doctors &amp; availability</h2>
            <p className="text-xs subtle">Statuses older than 2 hours are shown to patients as “Status Unknown”.</p>
          </div>
          <ul className="provider-list">
            {views.map((v) => (
              <li key={v.id} className="provider-row">
                <DoctorIdentity view={v} />
                <div className="provider-row__status">
                  <DoctorStatusBadge status={v.status} />
                  <StatusTimestamp status={v.status} now={now} />
                </div>
                <StatusControls view={v} />
              </li>
            ))}
          </ul>
        </section>
      )}

      {tab === 'appointments' && (
        <section className="panel" aria-labelledby="appointments-heading">
          <div className="panel__head">
            <h2 id="appointments-heading">Appointments</h2>
            <div className="cluster">
              <label htmlFor="appt-doctor" className="sr-only">
                Filter by doctor
              </label>
              <select id="appt-doctor" className="select" style={{ width: 'auto' }} value={doctorFilter} onChange={(e) => setDoctorFilter(e.target.value)}>
                <option value="">All doctors</option>
                {doctors.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
              <label className="checkbox">
                <input type="checkbox" checked={showPast} onChange={(e) => setShowPast(e.target.checked)} />
                Include past &amp; closed
              </label>
            </div>
          </div>
          <AppointmentsTable appointments={tableRows} now={now} onStatus={setAppointmentStatus} />
        </section>
      )}

      <Modal
        open={Boolean(editing)}
        title={editing ? `Update ${editing.doctor.name}` : ''}
        description="Choose the doctor’s current status. Patients see the change immediately (demo)."
        onClose={() => setEditingId(null)}
        wide
        footer={<Button onClick={() => setEditingId(null)}>Done</Button>}
      >
        {editing && (
          <div className="stack">
            <div className="cluster">
              <DoctorStatusBadge status={editing.status} />
              <StatusTimestamp status={editing.status} now={now} />
            </div>
            <StatusControls key={editing.id} view={editing} />
          </div>
        )}
      </Modal>
    </DashboardShell>
  );
}
