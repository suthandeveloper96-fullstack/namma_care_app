import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ArrowLeft, Briefcase, Building2, CircleCheck, GraduationCap, Info, Languages, MapPin, Stethoscope } from 'lucide-react';
import Button from '../components/ui/Button';
import { DemoBadge } from '../components/ui/Badge';
import { ErrorState } from '../components/ui/EmptyState';
import Tabs from '../components/ui/Tabs';
import DoctorPhoto from '../components/domain/DoctorPhoto';
import { DoctorStatusBadge, StatusTimestamp } from '../components/domain/DoctorStatus';
import { bookingPath } from '../components/domain/DoctorCard';
import { getDoctorById } from '../data/doctors';
import { selectAllAppointments } from '../features/appointments/appointmentsSlice';
import { selectStatusById } from '../features/doctorStatus/doctorStatusSlice';
import { selectLocation } from '../features/profile/profileSlice';
import { buildDoctorView } from '../hooks/useDoctorViews';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { useNow } from '../hooks/useNow';
import { getBookableDates, getSlotsForDate } from '../utils/booking';
import { parseDateKey } from '../utils/date';
import { DOCTOR_STATUSES } from '../utils/doctorStatus';
import { formatCurrency, formatDayLabel, formatDistance, formatHours, formatTime } from '../utils/format';

const WEEKDAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const PREPARATION = [
  'Carry a valid photo ID proof',
  'Bring previous medical records (if any)',
  'Keep a list of medicines you currently take',
  'Arrive 10–15 minutes early',
];

function SlotsPanel({ doctor, appointments, now }) {
  const navigate = useNavigate();
  const dates = useMemo(
    () => getBookableDates(doctor, now).filter((d) => getSlotsForDate(doctor, d, appointments, now).some((s) => s.state === 'free')),
    [doctor, appointments, now],
  );
  const [date, setDate] = useState(dates[0] ?? null);
  const active = dates.includes(date) ? date : dates[0];
  const free = active ? getSlotsForDate(doctor, active, appointments, now).filter((s) => s.state === 'free') : [];

  return (
    <section className="panel" aria-labelledby="slots-heading">
      <div className="panel__head">
        <h2 id="slots-heading">Available Slots</h2>
        <span className="text-xs subtle">Simulated</span>
      </div>
      {dates.length ? (
        <>
          <div className="day-tabs" role="radiogroup" aria-label="Choose a day">
            {dates.slice(0, 6).map((d) => (
              <button key={d} type="button" role="radio" aria-checked={d === active} className="day-tab" onClick={() => setDate(d)}>
                <strong>{formatDayLabel(d, now).split(',')[0]}</strong>
                <span>{parseDateKey(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
              </button>
            ))}
          </div>
          <div className="slot-grid slot-grid--compact">
            {free.slice(0, 12).map((s) => (
              <button key={s.time} type="button" className="slot" onClick={() => navigate(`/book/${doctor.id}?date=${active}&time=${s.time}`)}>
                {formatTime(s.time)}
              </button>
            ))}
          </div>
          {free.length > 12 && (
            <Link to={`/book/${doctor.id}?date=${active}`} className="text-xs fw-600">
              +{free.length - 12} more slots
            </Link>
          )}
        </>
      ) : (
        <p className="muted text-sm">No open demo slots in the next 14 days.</p>
      )}
    </section>
  );
}

function DoctorDetails({ doctor }) {
  const now = useNow();
  const statusById = useSelector(selectStatusById);
  const appointments = useSelector(selectAllAppointments);
  const origin = useSelector(selectLocation);
  const view = buildDoctorView(doctor, { statusById, appointments, now, origin });
  const { hospital, specialty, status, nextSlot } = view;
  const [tab, setTab] = useState('about');

  return (
    <div className="container page">
      <Link to="/doctors" className="back-link">
        <ArrowLeft size={16} aria-hidden="true" /> Back to Doctors
      </Link>

      <section className="profile-card">
        <DoctorPhoto doctor={doctor} size={128} rounded="square" className="profile-card__avatar" />
        <div className="profile-card__main">
          <div className="cluster">
            <h1>{doctor.name}</h1>
            <DemoBadge>Fictional profile</DemoBadge>
          </div>
          <p className="doctor-row__specialty">{specialty.name}</p>
          <p className="doctor-row__meta">
            <GraduationCap aria-hidden="true" /> {doctor.qualification}
            <span className="dot" aria-hidden="true" />
            <Briefcase aria-hidden="true" /> {doctor.experienceYears} years experience
          </p>
          <p className="doctor-row__meta">
            <MapPin aria-hidden="true" />
            <span>
              <Link to={`/hospitals/${hospital.id}`}>{hospital.name}</Link>, {hospital.area}
            </span>
          </p>
          <p className="doctor-row__meta">
            <Languages aria-hidden="true" /> {doctor.languages.join(', ')}
          </p>
        </div>
        <div className="profile-card__side">
          <DoctorStatusBadge status={status} />
          <StatusTimestamp status={status} now={now} />
          <p className="profile-card__fee">
            {formatCurrency(doctor.fee)} <span>Consultation Fee</span>
          </p>
          <p className="doctor-row__meta">
            <MapPin aria-hidden="true" /> {formatDistance(view.distanceKm)} away
          </p>
          <div className="cluster">
            <Button to={bookingPath(doctor.id, nextSlot)} variant="primary">
              Book Appointment
            </Button>
            <Button to={`/hospitals/${hospital.id}`} variant="outline">
              View Hospital
            </Button>
          </div>
        </div>
      </section>

      <div className="detail-layout">
        <div className="stack">
          <Tabs
            label="Doctor information"
            value={tab}
            onChange={setTab}
            tabs={[
              { value: 'about', label: 'About' },
              { value: 'availability', label: 'Availability' },
              { value: 'hospital', label: 'Hospital' },
            ]}
          />
          <section className="panel" role="tabpanel">
            {tab === 'about' && (
              <div className="stack">
                <h2 className="panel__title">About {doctor.name}</h2>
                <p className="text-sm muted">
                  {doctor.about} Qualifications and experience shown here are invented for the demo and are not verified.
                </p>
                <div className="fact-row">
                  <div>
                    <GraduationCap aria-hidden="true" />
                    <strong>{doctor.qualification.split(',')[0]}</strong>
                    <span>Qualification</span>
                  </div>
                  <div>
                    <Briefcase aria-hidden="true" />
                    <strong>{doctor.experienceYears} years</strong>
                    <span>Experience</span>
                  </div>
                  <div>
                    <Stethoscope aria-hidden="true" />
                    <strong>{specialty.name}</strong>
                    <span>Specialty</span>
                  </div>
                </div>
                <h3 className="panel__subtitle">Hospital Information</h3>
                <div className="hospital-inline">
                  <span className="icon-tile">
                    <Building2 aria-hidden="true" />
                  </span>
                  <div>
                    <p className="fw-600">{hospital.name}</p>
                    <p className="text-xs subtle">
                      {hospital.address}, {hospital.city} – {hospital.pin}
                    </p>
                    <p className="text-xs subtle">{formatDistance(view.distanceKm)} away</p>
                  </div>
                  <Link to={`/hospitals/${hospital.id}`} className="text-xs fw-600">
                    View Hospital Details
                  </Link>
                </div>
              </div>
            )}
            {tab === 'availability' && (
              <div className="stack">
                <h2 className="panel__title">Current demo status</h2>
                <div className="cluster">
                  <DoctorStatusBadge status={status} />
                  <StatusTimestamp status={status} now={now} />
                </div>
                <p className="text-sm muted">
                  {status.stale
                    ? 'No recent update — contact the facility before travelling. In this demo, a provider can update it from the dashboard.'
                    : DOCTOR_STATUSES[status.key].description}
                  {status.key === 'delayed' && status.delayMinutes ? ` — about ${status.delayMinutes} minutes behind.` : ''}
                </p>
                <h3 className="panel__subtitle">Working hours (simulated)</h3>
                <ul className="hours-list">
                  {doctor.schedule.days.map((d) => (
                    <li key={d}>
                      <span>{WEEKDAY_NAMES[d]}</span>
                      <span>{doctor.schedule.sessions.map((s) => `${formatTime(s.start)} – ${formatTime(s.end)}`).join(', ')}</span>
                    </li>
                  ))}
                </ul>
                <p className="text-xs subtle">{doctor.schedule.slotMinutes}-minute consultation slots</p>
              </div>
            )}
            {tab === 'hospital' && (
              <div className="stack">
                <h2 className="panel__title">{hospital.name}</h2>
                <p className="text-sm muted">{hospital.description}</p>
                <dl className="dl">
                  <dt>Address</dt>
                  <dd>
                    {hospital.address}, {hospital.city} {hospital.pin}
                  </dd>
                  <dt>Hours</dt>
                  <dd>{formatHours(hospital.hours)}</dd>
                  <dt>Distance</dt>
                  <dd>{formatDistance(view.distanceKm)} (approx.)</dd>
                </dl>
                <ul className="check-list">
                  {hospital.facilities.map((f) => (
                    <li key={f}>{f}</li>
                  ))}
                </ul>
              </div>
            )}
          </section>
        </div>

        <aside className="stack">
          <SlotsPanel doctor={doctor} appointments={appointments} now={now} />
          <section className="panel panel--tint" aria-labelledby="prep-heading">
            <h2 id="prep-heading" className="panel__title">
              Appointment Preparation
            </h2>
            <ul className="tick-list">
              {PREPARATION.map((item) => (
                <li key={item}>
                  <CircleCheck size={16} aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
          </section>
          <p className="note-line">
            <Info size={15} aria-hidden="true" />
            This is a demo platform. Appointments are simulated and not sent to real hospitals.
          </p>
        </aside>
      </div>
    </div>
  );
}

export default function DoctorDetailsPage() {
  const { doctorId } = useParams();
  const doctor = getDoctorById(doctorId);
  useDocumentTitle(doctor?.name ?? 'Doctor not found');
  if (!doctor) {
    return (
      <div className="container page">
        <ErrorState title="Doctor not found" actions={<Button to="/doctors" variant="primary">Browse doctors</Button>}>
          This demo profile does not exist or the link is outdated.
        </ErrorState>
      </div>
    );
  }
  // Keyed so local state (tab, selected day) resets when navigating between doctors.
  return <DoctorDetails key={doctor.id} doctor={doctor} />;
}
