import { appointmentAdded, appointmentStatusChanged } from './appointmentsSlice';
import { getDoctorById } from '../../data/doctors';
import { canCancelAppointment, checkSlotBookable } from '../../utils/booking';
import { generateId, generateReference } from '../../utils/reference';
import { normalizePhone, validateAge, validateFields, validateName, validateOptional, validatePhone } from '../../utils/validation';

export const PATIENT_SCHEMA = {
  name: validateName,
  age: validateAge,
  phone: validatePhone,
  reason: (v) => validateOptional(v, 'Reason for visit', { max: 200 }),
};

/**
 * Validates and stores a demo booking. Re-checks slot availability against the latest
 * state so double-clicks or another tab cannot create a duplicate booking.
 * Returns { ok, appointment } or { ok: false, error, fieldErrors }.
 */
export const requestBooking =
  ({ doctorId, date, time, patient }) =>
  (dispatch, getState) => {
    const doctor = getDoctorById(doctorId);
    const fieldErrors = validateFields(patient, PATIENT_SCHEMA);
    if (Object.keys(fieldErrors).length) {
      return { ok: false, error: 'Please fix the highlighted patient details.', fieldErrors };
    }

    const now = new Date();
    const check = checkSlotBookable({ doctor, date, time, appointments: getState().appointments.items, now });
    if (!check.ok) return { ok: false, error: check.reason, fieldErrors: {} };

    const appointment = {
      id: generateId('apt'),
      ref: generateReference('APT', now),
      owner: 'me',
      doctorId,
      hospitalId: doctor.hospitalId,
      date,
      time,
      patient: {
        name: patient.name.trim(),
        age: String(patient.age).trim(),
        phone: normalizePhone(patient.phone),
      },
      reason: (patient.reason ?? '').trim(),
      status: 'booked',
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };
    dispatch(appointmentAdded(appointment));
    return { ok: true, appointment };
  };

export const cancelAppointment = (id, actor = 'patient') => (dispatch, getState) => {
  const appointment = getState().appointments.items.find((a) => a.id === id);
  if (!appointment) return { ok: false, error: 'Appointment not found.' };
  if (actor === 'patient' && !canCancelAppointment(appointment)) {
    return { ok: false, error: 'Only upcoming appointments can be cancelled.' };
  }
  dispatch(appointmentStatusChanged({ id, status: 'cancelled', actor }));
  return { ok: true };
};
