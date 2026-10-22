import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Building2, CircleCheck, Clock, MapPin, Siren } from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';
import Alert from '../components/ui/Alert';
import Badge, { DemoBadge } from '../components/ui/Badge';
import Button from '../components/ui/Button';
import { ErrorState } from '../components/ui/EmptyState';
import DoctorCard from '../components/domain/DoctorCard';
import { getDoctorsByHospital } from '../data/doctors';
import { getHospitalById } from '../data/hospitals';
import { selectLocation } from '../features/profile/profileSlice';
import { summarizeStatuses, useDoctorViews } from '../hooks/useDoctorViews';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { useNow } from '../hooks/useNow';
import { formatDistance, formatHours } from '../utils/format';
import { distanceKm } from '../utils/geo';
import { isOpenAt } from '../utils/hours';

export default function HospitalDetailsPage() {
  const { hospitalId } = useParams();
  const hospital = getHospitalById(hospitalId);
  useDocumentTitle(hospital?.name ?? 'Facility not found');
  const now = useNow();
  const location = useSelector(selectLocation);
  const doctors = useMemo(() => (hospital ? getDoctorsByHospital(hospital.id) : []), [hospital]);
  const views = useDoctorViews(now, { doctors });

  if (!hospital) {
    return (
      <div className="container page">
        <ErrorState title="Facility not found" actions={<Button to="/hospitals" variant="primary">Browse facilities</Button>}>
          This demo facility does not exist or the link is outdated.
        </ErrorState>
      </div>
    );
  }

  const summary = summarizeStatuses(views);
  const open = isOpenAt(hospital.hours, now);

  return (
    <div className="container page">
      <PageHeader
        breadcrumbs={[{ label: 'Home', to: '/' }, { label: 'Hospitals', to: '/hospitals' }, { label: hospital.name }]}
        eyebrow={hospital.type}
        eyebrowIcon={Building2}
        title={hospital.name}
        description={hospital.description}
        actions={<DemoBadge>Fictional facility</DemoBadge>}
      />

      <div className="with-sidebar with-sidebar--right">
        <section className="stack" aria-labelledby="doctors-heading">
          <div className="section-header" style={{ marginBottom: 0 }}>
            <div>
              <h2 id="doctors-heading" style={{ fontSize: 'var(--fs-xl)' }}>
                Doctors at this {hospital.type.toLowerCase()}
              </h2>
              <p>
                {summary.available} available · {summary.busy} busy or delayed · {summary.unknown} away or unknown (demo)
              </p>
            </div>
          </div>
          <div className="stack stack--sm doctor-list">
            {views.map((v) => (
              <DoctorCard key={v.id} view={v} now={now} showHospital={false} />
            ))}
          </div>
        </section>

        <aside className="stack sticky-panel">
          <div className="card card--pad stack">
            <div className="cluster">
              <Badge tone={open ? 'success' : 'neutral'}>{open ? 'Open now' : 'Closed now'}</Badge>
              {hospital.emergency && (
                <Badge tone="danger" icon={Siren}>
                  24×7 casualty (demo)
                </Badge>
              )}
            </div>
            <dl className="dl">
              <dt>Address</dt>
              <dd>
                {hospital.address}, {hospital.city} {hospital.pin}
              </dd>
              <dt>Distance</dt>
              <dd>
                {formatDistance(distanceKm(location, hospital))} from {location.area} (approx.)
              </dd>
              <dt>Hours</dt>
              <dd>{formatHours(hospital.hours)}</dd>
            </dl>
            <div>
              <p className="field__label" style={{ marginBottom: 8 }}>
                Facilities (demo)
              </p>
              <ul className="check-list">
                {hospital.facilities.map((f) => (
                  <li key={f}>
                    <CircleCheck size={16} aria-hidden="true" /> {f}
                  </li>
                ))}
              </ul>
            </div>
            <Button to={`/doctors?hospital=${hospital.id}`} variant="primary" block>
              Find doctors here
            </Button>
          </div>
          <div className="map-placeholder" role="img" aria-label={`Location placeholder for ${hospital.name}`}>
            <MapPin size={26} aria-hidden="true" />
            <p className="fw-600 text-sm">{hospital.area}, {hospital.city}</p>
            <p className="text-xs subtle">Map integration is not configured in this demo.</p>
          </div>
          {hospital.emergency && (
            <Alert tone="warning" icon={Clock}>
              Casualty services listed here are fictional. In an emergency, call 108 or 112 — do not rely on this app.
            </Alert>
          )}
        </aside>
      </div>
    </div>
  );
}
