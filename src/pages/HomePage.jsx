import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  ArrowRight,
  Building2,
  CalendarCheck,
  ClipboardList,
  HeartHandshake,
  MoreHorizontal,
  Pill,
  Search,
  ShieldCheck,
  Stethoscope,
  Store,
  UserCheck,
} from 'lucide-react';
import Button from '../components/ui/Button';
import { DemoBadge } from '../components/ui/Badge';
import { HeroIllustration } from '../components/brand/Illustrations';
import { HERO_PHOTO } from '../data/doctorPhotos';
import LocationSelector from '../components/layout/LocationSelector';
import DoctorCard from '../components/domain/DoctorCard';
import HospitalCard from '../components/domain/HospitalCard';
import PharmacyCard from '../components/domain/PharmacyCard';
import DataIcon from '../components/domain/SpecialtyIcon';
import { HOSPITALS } from '../data/hospitals';
import { SPECIALTIES } from '../data/specialties';
import { selectLocation } from '../features/profile/profileSlice';
import { summarizeStatuses, useDoctorViews } from '../hooks/useDoctorViews';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { useNow } from '../hooks/useNow';
import { usePharmacySummaries } from '../hooks/usePharmacyData';
import { t } from '../i18n/strings';
import { distanceKm } from '../utils/geo';

const NEARBY_KM = 30;

const FEATURES = [
  { icon: Building2, title: 'Find Nearby Hospitals', text: 'Locate demo hospitals & clinics in your area', to: '/hospitals' },
  { icon: CalendarCheck, title: 'Book Appointments', text: 'Choose from open time slots based on demo status', to: '/book' },
  { icon: Pill, title: 'Order Medicines', text: 'Get pharmacy essentials delivered (simulated)', to: '/medicines' },
  { icon: ClipboardList, title: 'Track & Manage', text: 'View your appointments and order status', to: '/profile' },
];

const STEPS = [
  { icon: Search, title: '1. Search', text: 'Find nearby hospitals, doctors or pharmacies' },
  { icon: CalendarCheck, title: '2. Book', text: 'Choose a time slot and confirm' },
  { icon: HeartHandshake, title: '3. Get Care', text: 'Visit, or get medicines delivered to your door' },
];

export default function HomePage() {
  useDocumentTitle(null);
  const navigate = useNavigate();
  const now = useNow();
  const location = useSelector(selectLocation);
  const [query, setQuery] = useState('');
  const views = useDoctorViews(now);
  const pharmacies = usePharmacySummaries();

  const nearbyViews = useMemo(() => {
    const near = views.filter((v) => v.distanceKm <= NEARBY_KM);
    return near.length ? near : views;
  }, [views]);

  const hospitals = useMemo(
    () =>
      HOSPITALS.map((h) => ({
        hospital: h,
        distanceKm: distanceKm(location, h),
        summary: summarizeStatuses(views.filter((v) => v.hospital.id === h.id)),
      })).sort((a, b) => a.distanceKm - b.distanceKm),
    [views, location],
  );

  const availableDoctors = nearbyViews
    .filter((v) => v.status.key === 'available' && v.nextSlot)
    .sort((a, b) => a.distanceKm - b.distanceKm)
    .slice(0, 3);
  const summary = summarizeStatuses(nearbyViews);
  const nearbyHospitalCount = hospitals.filter((h) => h.distanceKm <= NEARBY_KM).length;
  const nearbyPharmacyCount = pharmacies.filter((p) => p.distanceKm <= NEARBY_KM).length;

  const onSearch = (event) => {
    event.preventDefault();
    const q = query.trim();
    navigate(q ? `/doctors?q=${encodeURIComponent(q)}` : '/doctors');
  };

  return (
    <div className="container home">
      <section className="home-hero">
        <div className="home-hero__copy">
          <p className="page-header__eyebrow">
            <ShieldCheck size={14} aria-hidden="true" /> Tamil Nadu · Demo prototype
          </p>
          <h1 className="home-hero__title">{t('hero.title')}</h1>
          <p className="home-hero__subtitle">
            Find nearby hospitals, check doctor availability, book appointments and get medicines delivered — all in one place.
          </p>

          <form className="hero-search" onSubmit={onSearch} role="search">
            <label htmlFor="home-search" className="sr-only">
              Search doctors, specialties, hospitals or clinics
            </label>
            <div className="input-group hero-search__input">
              <Search aria-hidden="true" />
              <input
                id="home-search"
                className="input"
                type="search"
                placeholder="Search doctors, hospitals, specialties…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <LocationSelector compact />
            <button type="submit" className="btn btn--primary btn--icon hero-search__go" aria-label="Search">
              <Search size={18} aria-hidden="true" />
            </button>
          </form>

          <div className="cluster hero-ctas">
            <Button to="/doctors?status=available" variant="primary">
              {t('cta.findDoctors')}
            </Button>
            <Button to="/medicines" variant="outline">
              {t('cta.orderMedicines')}
            </Button>
          </div>

          <div className="live-card" aria-labelledby="live-title">
            <p id="live-title" className="live-card__title">
              Live Availability <span>(Demo)</span>
            </p>
            <div className="live-card__stats">
              <Link to="/hospitals" className="live-stat">
                <Building2 aria-hidden="true" />
                <strong>{nearbyHospitalCount}</strong>
                <span>Hospitals &amp; Clinics</span>
              </Link>
              <Link to="/doctors?status=available" className="live-stat">
                <UserCheck aria-hidden="true" />
                <strong>{summary.available}</strong>
                <span>Available Doctors</span>
              </Link>
              <Link to="/pharmacies" className="live-stat">
                <Store aria-hidden="true" />
                <strong>{nearbyPharmacyCount}</strong>
                <span>Nearby Pharmacies</span>
              </Link>
            </div>
          </div>
        </div>
        <HeroIllustration photo={HERO_PHOTO} />
      </section>

      <section className="feature-strip" aria-label="What you can do">
        {FEATURES.map(({ icon: Icon, title, text, to }) => (
          <Link key={title} to={to} className="feature-item">
            <span className="icon-tile">
              <Icon aria-hidden="true" />
            </span>
            <span>
              <strong>{title}</strong>
              <span>{text}</span>
            </span>
          </Link>
        ))}
      </section>

      <div className="home-split">
        <section className="panel" aria-labelledby="specialties-heading">
          <div className="panel__head">
            <h2 id="specialties-heading">Popular Specialties</h2>
            <Link to="/doctors" className="text-sm fw-600">
              View All
            </Link>
          </div>
          <ul className="specialty-circles">
            {SPECIALTIES.slice(0, 7).map((s) => (
              <li key={s.id}>
                <Link to={`/doctors?specialty=${s.id}`} className="specialty-circle">
                  <span className="specialty-circle__icon">
                    <DataIcon name={s.icon} />
                  </span>
                  <span>{s.name.replace('Obstetrics & ', '')}</span>
                </Link>
              </li>
            ))}
            <li>
              <Link to="/doctors" className="specialty-circle">
                <span className="specialty-circle__icon">
                  <MoreHorizontal aria-hidden="true" />
                </span>
                <span>More</span>
              </Link>
            </li>
          </ul>
        </section>

        <section className="panel panel--tint" aria-labelledby="pharmacies-heading">
          <div className="panel__head">
            <h2 id="pharmacies-heading">Nearby Pharmacies</h2>
            <Link to="/pharmacies" className="text-sm fw-600">
              View All
            </Link>
          </div>
          <div className="stack stack--sm">
            {pharmacies.slice(0, 3).map((p) => (
              <PharmacyCard key={p.pharmacy.id} {...p} now={now} compact />
            ))}
          </div>
        </section>
      </div>

      <section className="panel section-gap" aria-labelledby="hospitals-heading">
        <div className="panel__head">
          <h2 id="hospitals-heading">Nearby Hospitals &amp; Clinics</h2>
          <Link to="/hospitals" className="text-sm fw-600">
            View All
          </Link>
        </div>
        <div className="grid grid--3">
          {hospitals.slice(0, 3).map((h) => (
            <HospitalCard key={h.hospital.id} {...h} now={now} compact />
          ))}
        </div>
      </section>

      <section className="panel section-gap" aria-labelledby="available-heading">
        <div className="panel__head">
          <div>
            <h2 id="available-heading">Available doctors near {location.area}</h2>
            <p className="text-xs subtle">Reported “Available” in the demo, with their next open slot.</p>
          </div>
          <DemoBadge>Simulated</DemoBadge>
        </div>
        {availableDoctors.length ? (
          <div className="stack stack--sm doctor-list">
            {availableDoctors.map((v) => (
              <DoctorCard key={v.id} view={v} now={now} />
            ))}
          </div>
        ) : (
          <p className="muted text-sm">No demo doctors near {location.area} are currently marked available. Try another area.</p>
        )}
        <Link to="/doctors?status=available" className="kbd-link text-sm">
          See all available doctors <ArrowRight size={15} aria-hidden="true" />
        </Link>
      </section>

      <section className="steps-band section-gap" aria-labelledby="steps-heading">
        <h2 id="steps-heading">NammaCare works in simple steps</h2>
        <ol className="steps-band__list">
          {STEPS.map(({ icon: Icon, title, text }) => (
            <li key={title}>
              <span className="steps-band__icon">
                <Icon aria-hidden="true" />
              </span>
              <span>
                <strong>{title}</strong>
                <span>{text}</span>
              </span>
            </li>
          ))}
        </ol>
      </section>

      <p className="home-disclaimer">
        <Stethoscope size={15} aria-hidden="true" />
        NammaCare does not diagnose conditions or recommend medicines. In an emergency call 108 or 112.{' '}
        <Link to="/info/emergency">Emergency disclaimer</Link>
      </p>
    </div>
  );
}
