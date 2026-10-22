import { useState } from 'react';
import { DoctorAvatar } from '../brand/Illustrations';
import { DOCTOR_PHOTOS } from '../../data/doctorPhotos';

/** Doctor image: uses a configured photo when available, otherwise the illustrated avatar. */
export default function DoctorPhoto({ doctor, size = 56, rounded = 'circle', className = '' }) {
  const src = DOCTOR_PHOTOS[doctor.id];
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return <DoctorAvatar seed={doctor.id} variant={doctor.avatar} size={size} rounded={rounded} className={className} />;
  }
  return (
    <img
      src={src}
      alt={`Photo for demo profile ${doctor.name}`}
      width={size}
      height={size}
      loading="lazy"
      className={`doctor-photo doctor-photo--${rounded} ${className}`}
      onError={() => setFailed(true)}
    />
  );
}
