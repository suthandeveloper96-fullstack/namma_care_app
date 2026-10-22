import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { DOCTORS } from '../data/doctors';
import { getHospitalById } from '../data/hospitals';
import { getSpecialtyById } from '../data/specialties';
import { selectAllAppointments } from '../features/appointments/appointmentsSlice';
import { selectStatusById } from '../features/doctorStatus/doctorStatusSlice';
import { selectLocation } from '../features/profile/profileSlice';
import { findNextFreeSlot } from '../utils/booking';
import { resolveDoctorStatus } from '../utils/doctorStatus';
import { distanceKm } from '../utils/geo';

/** Combines static doctor data with live demo status, distance and next free slot. */
export function buildDoctorView(doctor, { statusById, appointments, now, origin, onDate }) {
  const hospital = getHospitalById(doctor.hospitalId);
  return {
    id: doctor.id,
    doctor,
    hospital,
    specialty: getSpecialtyById(doctor.specialtyId),
    status: resolveDoctorStatus(statusById[doctor.id], now.getTime()),
    distanceKm: distanceKm(origin, hospital),
    nextSlot: findNextFreeSlot(doctor, appointments, now, onDate ? { onDate } : undefined),
  };
}

/** Groups resolved statuses for hospital-level summaries. */
export function summarizeStatuses(views) {
  return views.reduce(
    (acc, { status }) => {
      acc.total += 1;
      if (status.key === 'available') acc.available += 1;
      else if (status.key === 'with_patient' || status.key === 'delayed') acc.busy += 1;
      else acc.unknown += 1;
      return acc;
    },
    { total: 0, available: 0, busy: 0, unknown: 0 },
  );
}

export function useDoctorViews(now, { doctors = DOCTORS, onDate = null } = {}) {
  const statusById = useSelector(selectStatusById);
  const appointments = useSelector(selectAllAppointments);
  const origin = useSelector(selectLocation);
  // `now` is bucketed to the minute so views are not rebuilt more often than needed.
  const minute = Math.floor(now.getTime() / 60000);
  return useMemo(
    () => doctors.map((d) => buildDoctorView(d, { statusById, appointments, now: new Date(minute * 60000), origin, onDate })),
    [doctors, statusById, appointments, origin, onDate, minute],
  );
}
