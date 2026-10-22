import { Link } from 'react-router-dom';
import { CalendarDays, Clock, MapPin, User } from 'lucide-react';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import { getDoctorById } from '../../data/doctors';
import { getHospitalById } from '../../data/hospitals';
import { getSpecialtyById } from '../../data/specialties';
import { APPOINTMENT_STATUS, canCancelAppointment } from '../../utils/booking';
import { formatDateShort, formatTime } from '../../utils/format';
import DoctorPhoto from './DoctorPhoto';

export default function AppointmentCard({ appointment, now, onCancel }) {
  const doctor = getDoctorById(appointment.doctorId);
  const hospital = getHospitalById(appointment.hospitalId);
  const status = APPOINTMENT_STATUS[appointment.status];
  const cancellable = canCancelAppointment(appointment, now);

  return (
    <article className="card card--pad appointment-card">
      <div className="appointment-card__date" aria-hidden="true">
        <span>{formatDateShort(appointment.date).split(',')[0]}</span>
        <strong>{Number(appointment.date.slice(8))}</strong>
      </div>
      <div className="appointment-card__body">
        <div className="cluster cluster--between">
          <div className="cluster">
            <DoctorPhoto doctor={doctor} size={44} />
            <div>
              <h3 className="card-title" style={{ fontSize: 'var(--fs-md)' }}>
                <Link to={`/doctors/${doctor.id}`}>{doctor.name}</Link>
              </h3>
              <p className="text-sm muted">{getSpecialtyById(doctor.specialtyId)?.name}</p>
            </div>
          </div>
          <Badge tone={status.tone}>{status.label}</Badge>
        </div>
        <div className="meta-row">
          <span>
            <CalendarDays aria-hidden="true" />
            {formatDateShort(appointment.date)}
          </span>
          <span>
            <Clock aria-hidden="true" />
            {formatTime(appointment.time)}
          </span>
          <span>
            <MapPin aria-hidden="true" />
            {hospital?.name}
          </span>
          <span>
            <User aria-hidden="true" />
            {appointment.patient.name}
          </span>
        </div>
        <div className="cluster cluster--between">
          <span className="text-xs subtle">
            Demo ref <span className="tabular fw-600">{appointment.ref}</span>
          </span>
          <div className="cluster">
            <Button size="sm" to={`/appointments/${appointment.id}`}>
              View details
            </Button>
            {cancellable && onCancel && (
              <Button size="sm" variant="danger" onClick={() => onCancel(appointment)}>
                Cancel
              </Button>
            )}
            {!cancellable && appointment.status !== 'booked' && (
              <Button size="sm" variant="secondary" to={`/book/${doctor.id}`}>
                Book again
              </Button>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
