import { useMemo, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ArrowLeft, ArrowRight, CalendarCheck, FlaskConical, MapPin, Search } from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';
import Alert from '../components/ui/Alert';
import Button from '../components/ui/Button';
import { ErrorState } from '../components/ui/EmptyState';
import { TextAreaField, TextField, PhoneField } from '../components/ui/Field';
import Stepper from '../components/ui/Stepper';
import DoctorPhoto from '../components/domain/DoctorPhoto';
import { DoctorStatusBadge } from '../components/domain/DoctorStatus';
import { NextSlot } from '../components/domain/DoctorCard';
import MonthCalendar from '../components/domain/MonthCalendar';
import { SlotGrid } from '../components/domain/SlotPicker';
import { getDoctorById } from '../data/doctors';
import { getHospitalById } from '../data/hospitals';
import { getSpecialtyById } from '../data/specialties';
import { selectAllAppointments } from '../features/appointments/appointmentsSlice';
import { PATIENT_SCHEMA, requestBooking } from '../features/appointments/appointmentThunks';
import { selectLocation } from '../features/profile/profileSlice';
import { useDoctorViews } from '../hooks/useDoctorViews';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { useNow } from '../hooks/useNow';
import { useToast } from '../hooks/useToast';
import { getBookableDates, getSlotsForDate } from '../utils/booking';
import { formatCurrency, formatDateShort, formatDistance, formatTime } from '../utils/format';
import { distanceKm } from '../utils/geo';
import { validateFields } from '../utils/validation';

const STEPS = ['Doctor', 'Date', 'Time', 'Patient', 'Review', 'Confirm'];
// Screens: 0 doctor · 1 date & time · 3 patient · 4 review (step 2 shares the date & time screen).
const SCHEDULE = 1;
const PATIENT = 3;
const REVIEW = 4;

function DoctorPicker({ selectedId, onSelect, now }) {
  const [query, setQuery] = useState('');
  const views = useDoctorViews(now);
  const q = query.trim().toLowerCase();
  const list = views
    .filter((v) => !q || `${v.doctor.name} ${v.specialty.name} ${v.hospital.name} ${v.hospital.city}`.toLowerCase().includes(q))
    .sort((a, b) => a.distanceKm - b.distanceKm);

  return (
    <div className="stack">
      <div className="input-group">
        <Search aria-hidden="true" />
        <label htmlFor="picker-search" className="sr-only">
          Search doctors
        </label>
        <input
          id="picker-search"
          className="input"
          type="search"
          placeholder="Search by doctor, specialty or hospital"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>
      <div className="doctor-picker" role="radiogroup" aria-label="Choose a doctor">
        {list.map((v) => (
          <button key={v.id} type="button" role="radio" aria-checked={v.id === selectedId} className="doctor-option" onClick={() => onSelect(v.id)}>
            <DoctorPhoto doctor={v.doctor} size={44} />
            <span className="doctor-option__main">
              <strong>{v.doctor.name}</strong>
              <span className="text-xs subtle">
                {v.specialty.name} · {v.hospital.name} · {formatDistance(v.distanceKm)}
              </span>
            </span>
            <span className="doctor-option__side">
              <DoctorStatusBadge status={v.status} />
              <NextSlot slot={v.nextSlot} now={now} compact />
            </span>
          </button>
        ))}
        {!list.length && <p className="muted text-sm">No doctors match “{query}”.</p>}
      </div>
    </div>
  );
}

function DoctorSummary({ doctor, date, time }) {
  const origin = useSelector(selectLocation);
  const hospital = getHospitalById(doctor.hospitalId);
  return (
    <div className="booking-doctor">
      <DoctorPhoto doctor={doctor} size={64} />
      <div>
        <p className="fw-600">{doctor.name}</p>
        <p className="text-xs doctor-row__specialty">{getSpecialtyById(doctor.specialtyId).name}</p>
        <p className="text-xs subtle">
          <MapPin size={12} aria-hidden="true" style={{ display: 'inline', verticalAlign: '-1px' }} /> {hospital.name}
        </p>
        <p className="text-xs subtle">
          {formatCurrency(doctor.fee)} · {formatDistance(distanceKm(origin, hospital))}
        </p>
      </div>
      {(date || time) && (
        <dl className="booking-doctor__pick">
          <dt>Date</dt>
          <dd>{date ? formatDateShort(date) : '—'}</dd>
          <dt>Time</dt>
          <dd>{time ? formatTime(time) : '—'}</dd>
        </dl>
      )}
    </div>
  );
}

function initialStep(doctor, date, time, slotsFor) {
  if (!doctor) return 0;
  if (!date || !time) return SCHEDULE;
  return slotsFor(date).some((s) => s.time === time && s.state === 'free') ? PATIENT : SCHEDULE;
}

function BookAppointmentFlow() {
  useDocumentTitle('Book an appointment');
  const { doctorId: routeDoctorId } = useParams();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const toast = useToast();
  const now = useNow();
  const appointments = useSelector(selectAllAppointments);

  const routeDoctor = getDoctorById(routeDoctorId);
  const [doctorId, setDoctorId] = useState(routeDoctor?.id ?? null);
  const doctor = getDoctorById(doctorId);

  const bookableDates = useMemo(() => (doctor ? getBookableDates(doctor, now) : []), [doctor, now]);
  const slotsFor = (d) => (doctor && d ? getSlotsForDate(doctor, d, appointments, now) : []);

  const paramDate = bookableDates.includes(params.get('date')) ? params.get('date') : null;
  // Without a date in the URL, open on the first day that still has free slots.
  const firstFreeDate = (d) =>
    d ? getBookableDates(d, now).find((key) => getSlotsForDate(d, key, appointments, now).some((s) => s.state === 'free')) ?? null : null;
  const [date, setDate] = useState(() => paramDate ?? firstFreeDate(doctor));
  const [time, setTime] = useState(paramDate ? params.get('time') : null);
  const [step, setStep] = useState(() => initialStep(doctor, paramDate, paramDate ? params.get('time') : null, slotsFor));
  // Starts empty: patient details are entered for each booking rather than prefilled.
  const [patient, setPatient] = useState({ name: '', age: '', phone: '', reason: '' });
  const [fieldErrors, setFieldErrors] = useState({});
  const [acknowledged, setAcknowledged] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const freeCounts = useMemo(() => {
    const counts = {};
    bookableDates.forEach((d) => {
      counts[d] = doctor ? getSlotsForDate(doctor, d, appointments, now).filter((s) => s.state === 'free').length : 0;
    });
    return counts;
  }, [bookableDates, doctor, appointments, now]);

  const slots = slotsFor(date);
  const selectedSlotState = slots.find((s) => s.time === time)?.state;

  if (routeDoctorId && !routeDoctor) {
    return (
      <div className="container page">
        <ErrorState title="Doctor not found" actions={<Button to="/book" variant="primary">Choose a doctor</Button>}>
          This demo profile does not exist. Pick another doctor to continue.
        </ErrorState>
      </div>
    );
  }

  const hospital = doctor ? getHospitalById(doctor.hospitalId) : null;
  const stepperIndex = step === SCHEDULE ? (date ? 2 : 1) : step;

  const goTo = (next) => {
    setSubmitError('');
    setStep(next);
  };

  const continueFromPatient = () => {
    const errors = validateFields(patient, PATIENT_SCHEMA);
    setFieldErrors(errors);
    if (!Object.keys(errors).length) goTo(REVIEW);
  };

  const confirm = () => {
    if (!acknowledged) {
      setSubmitError('Please confirm you understand this is a simulated booking.');
      return;
    }
    setSubmitting(true);
    // Short artificial delay so the loading state is visible, like a real network request.
    setTimeout(() => {
      const result = dispatch(requestBooking({ doctorId, date, time, patient }));
      setSubmitting(false);
      if (result.ok) {
        toast('Demo appointment booked', { message: `Reference ${result.appointment.ref}` });
        navigate(`/appointments/${result.appointment.id}?new=1`, { replace: true });
        return;
      }
      setSubmitError(result.error);
      if (Object.keys(result.fieldErrors ?? {}).length) {
        setFieldErrors(result.fieldErrors);
        setStep(PATIENT);
      } else {
        setTime(null);
        setStep(SCHEDULE);
      }
    }, 600);
  };

  const setField = (field) => (e) => {
    setPatient((p) => ({ ...p, [field]: e.target.value }));
    if (fieldErrors[field]) setFieldErrors((errs) => ({ ...errs, [field]: '' }));
  };

  return (
    <div className="container page">
      <PageHeader
        breadcrumbs={[{ label: 'Home', to: '/' }, { label: 'Doctors', to: '/doctors' }, { label: 'Book appointment' }]}
        title="Book Appointment"
      />

      <section className="panel booking-panel" aria-live="polite">
        <Stepper steps={STEPS} current={stepperIndex} label="Booking progress" />

        {submitError && (
          <Alert tone="danger" title="Could not complete booking">
            {submitError}
          </Alert>
        )}

        {step === 0 && (
          <div className="stack">
            <h2 className="panel__title">Select a doctor</h2>
            <DoctorPicker
              selectedId={doctorId}
              now={now}
              onSelect={(id) => {
                setDoctorId(id);
                setDate(firstFreeDate(getDoctorById(id)));
                setTime(null);
              }}
            />
            <div className="booking-actions">
              <Button to="/doctors" variant="outline" icon={ArrowLeft}>
                Back
              </Button>
              <Button variant="primary" iconRight={ArrowRight} disabled={!doctor} onClick={() => goTo(SCHEDULE)}>
                Next
              </Button>
            </div>
          </div>
        )}

        {step === SCHEDULE && doctor && (
          <>
            <div className="booking-grid">
              <div className="booking-col">
                <DoctorSummary doctor={doctor} date={date} time={time} />
              </div>
              <div className="booking-col">
                <h2 className="booking-col__title">Select Date</h2>
                <MonthCalendar
                  value={date}
                  now={now}
                  freeCounts={freeCounts}
                  onChange={(d) => {
                    setDate(d);
                    setTime(null);
                  }}
                />
              </div>
              <div className="booking-col">
                <h2 className="booking-col__title">Available Time Slots</h2>
                {date ? (
                  <SlotGrid slots={slots} value={time} onChange={setTime} />
                ) : (
                  <p className="text-sm muted">Pick a highlighted date to see open slots.</p>
                )}
              </div>
            </div>
            <div className="booking-actions">
              <Button variant="outline" icon={ArrowLeft} onClick={() => goTo(0)}>
                Back
              </Button>
              <Button variant="primary" iconRight={ArrowRight} disabled={!time || selectedSlotState !== 'free'} onClick={() => goTo(PATIENT)}>
                Next
              </Button>
            </div>
          </>
        )}

        {step === PATIENT && doctor && (
          <form
            noValidate
            onSubmit={(e) => {
              e.preventDefault();
              continueFromPatient();
            }}
          >
            <div className="booking-grid booking-grid--two">
              <div className="booking-col">
                <DoctorSummary doctor={doctor} date={date} time={time} />
              </div>
              <div className="booking-col stack">
                <h2 className="booking-col__title">Patient information</h2>
                <p className="text-xs subtle">Only the minimum details needed for a demo booking. Please don’t enter medical history.</p>
                <div className="form-grid">
                  <TextField label="Patient name" required autoComplete="name" value={patient.name} onChange={setField('name')} error={fieldErrors.name} />
                  <TextField label="Age" required inputMode="numeric" maxLength={3} value={patient.age} onChange={setField('age')} error={fieldErrors.age} />
                  <PhoneField
                    required
                    className="span-2"
                    value={patient.phone}
                    onChange={(value) => setField('phone')({ target: { value } })}
                    error={fieldErrors.phone}
                    hint="Digits only. Nothing is sent — no SMS will be delivered."
                  />
                  <TextAreaField
                    label="Reason for visit"
                    optional
                    className="span-2"
                    maxLength={200}
                    placeholder="e.g. Follow-up consultation"
                    value={patient.reason}
                    onChange={setField('reason')}
                    error={fieldErrors.reason}
                    hint={`${patient.reason.length}/200 characters`}
                  />
                </div>
              </div>
            </div>
            <div className="booking-actions">
              <Button variant="outline" icon={ArrowLeft} onClick={() => goTo(SCHEDULE)}>
                Back
              </Button>
              <Button type="submit" variant="primary" iconRight={ArrowRight}>
                Review booking
              </Button>
            </div>
          </form>
        )}

        {step === REVIEW && doctor && (
          <div className="stack">
            <div className="booking-grid booking-grid--two">
              <div className="booking-col">
                <DoctorSummary doctor={doctor} date={date} time={time} />
              </div>
              <div className="booking-col stack">
                <h2 className="booking-col__title">Review your appointment</h2>
                {selectedSlotState !== 'free' && (
                  <Alert tone="warning" title="This slot is no longer available">
                    It may have been booked in another tab or the time has passed. Choose another time.
                  </Alert>
                )}
                <dl className="dl review-list">
                  <dt>Doctor</dt>
                  <dd>{doctor.name}</dd>
                  <dt>{hospital.type}</dt>
                  <dd>
                    {hospital.name}, {hospital.area}
                  </dd>
                  <dt>Date & time</dt>
                  <dd>
                    {formatDateShort(date)} at {formatTime(time)}
                  </dd>
                  <dt>Patient</dt>
                  <dd>
                    {patient.name.trim()}, {patient.age} yrs
                  </dd>
                  <dt>Mobile</dt>
                  <dd>{patient.phone}</dd>
                  {patient.reason.trim() && (
                    <>
                      <dt>Reason</dt>
                      <dd>{patient.reason.trim()}</dd>
                    </>
                  )}
                  <dt>Fee (pay at clinic)</dt>
                  <dd>{formatCurrency(doctor.fee)} — illustrative demo value</dd>
                </dl>
                <label className="checkbox">
                  <input type="checkbox" checked={acknowledged} onChange={(e) => setAcknowledged(e.target.checked)} />
                  I understand this is a simulated booking that is not sent to any hospital.
                </label>
              </div>
            </div>
            <div className="booking-actions">
              <Button variant="outline" icon={ArrowLeft} onClick={() => goTo(PATIENT)}>
                Back
              </Button>
              <Button variant="primary" icon={CalendarCheck} loading={submitting} disabled={selectedSlotState !== 'free'} onClick={confirm}>
                {submitting ? 'Booking…' : 'Confirm demo booking'}
              </Button>
            </div>
          </div>
        )}
      </section>

      <Alert tone="demo" icon={FlaskConical} className="mt-6">
        Appointments are saved only in this browser and are <strong>not sent to any hospital or doctor</strong>. Each
        doctor/date/time can be booked once; past or taken slots are disabled.
      </Alert>
    </div>
  );
}

/** Keyed by doctor so switching doctors via a link restarts the flow with fresh state. */
export default function BookAppointmentPage() {
  const { doctorId } = useParams();
  return <BookAppointmentFlow key={doctorId ?? 'none'} />;
}
