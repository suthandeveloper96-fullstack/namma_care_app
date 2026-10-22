import { Link } from 'react-router-dom';
import { Briefcase, GraduationCap, MapPin } from 'lucide-react';
import Button from '../ui/Button';
import DoctorPhoto from './DoctorPhoto';
import { DoctorStatusBadge, StatusTimestamp } from './DoctorStatus';
import { formatCurrency, formatDayLabel, formatDistance, formatTime } from '../../utils/format';

export function NextSlot({ slot, now, compact = false }) {
  if (!slot) return <span className="next-slot next-slot--none">No open demo slots in 14 days</span>;
  return (
    <span className="next-slot">
      {!compact && <span className="subtle">Next slot:</span>}
      <strong>
        {formatDayLabel(slot.date, now)}, {formatTime(slot.time)}
      </strong>
    </span>
  );
}

export function bookingPath(doctorId, nextSlot) {
  return nextSlot ? `/book/${doctorId}?date=${nextSlot.date}` : `/book/${doctorId}`;
}

/** Horizontal doctor result row: identity · demo status · actions. */
export default function DoctorCard({ view, now, showHospital = true }) {
  const { doctor, hospital, specialty, status, distanceKm, nextSlot } = view;
  return (
    <article className="doctor-row">
      <Link to={`/doctors/${doctor.id}`} className="doctor-row__avatar" tabIndex={-1} aria-hidden="true">
        <DoctorPhoto doctor={doctor} size={76} />
      </Link>

      <div className="doctor-row__info">
        <h3 className="doctor-row__name">
          <Link to={`/doctors/${doctor.id}`}>{doctor.name}</Link>
        </h3>
        <p className="doctor-row__specialty">{specialty?.name}</p>
        <p className="doctor-row__meta">
          <GraduationCap aria-hidden="true" />
          {doctor.qualification}
          <span className="dot" aria-hidden="true" />
          <Briefcase aria-hidden="true" />
          {doctor.experienceYears} yrs
        </p>
        {showHospital && (
          <p className="doctor-row__meta">
            <MapPin aria-hidden="true" />
            <span>
              <Link to={`/hospitals/${hospital.id}`}>{hospital.name}</Link>, {hospital.area}
            </span>
          </p>
        )}
        <p className="doctor-row__facts">
          <span>
            <MapPin aria-hidden="true" /> {formatDistance(distanceKm)}
          </span>
          <span className="doctor-row__fee">{formatCurrency(doctor.fee)}</span>
        </p>
      </div>

      <div className="doctor-row__status">
        <DoctorStatusBadge status={status} />
        <StatusTimestamp status={status} now={now} />
        <NextSlot slot={nextSlot} now={now} />
      </div>

      <div className="doctor-row__actions">
        <Button to={`/doctors/${doctor.id}`} size="sm" variant="outline">
          View Profile
        </Button>
        <Button to={bookingPath(doctor.id, nextSlot)} size="sm" variant="primary">
          Book Appointment
        </Button>
      </div>
    </article>
  );
}
