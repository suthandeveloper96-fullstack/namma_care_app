import {
  Building2,
  CalendarCheck,
  ClipboardList,
  House,
  LayoutDashboard,
  Pill,
  Stethoscope,
  Store,
  UserRound,
} from 'lucide-react';
import { t } from '../../i18n/strings';

export const PRIMARY_NAV = [
  { to: '/', label: 'Home', icon: House, end: true },
  { to: '/doctors', label: t('nav.doctors'), icon: Stethoscope },
  { to: '/hospitals', label: t('nav.hospitals'), icon: Building2 },
  { to: '/pharmacies', label: t('nav.pharmacies'), icon: Store },
  { to: '/medicines', label: t('nav.medicines'), icon: Pill },
];

export const ACCOUNT_NAV = [
  { to: '/profile', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/appointments', label: t('nav.appointments'), icon: CalendarCheck },
  { to: '/orders', label: t('nav.orders'), icon: ClipboardList },
  { to: '/profile/details', label: t('nav.profile'), icon: UserRound },
];

export const DASHBOARD_NAV = [
  { to: '/dashboard/provider', label: t('nav.providerDashboard'), icon: Building2 },
  { to: '/dashboard/pharmacy', label: t('nav.pharmacyDashboard'), icon: Store },
];

export const TAB_BAR_NAV = [
  { to: '/', label: 'Home', icon: House, end: true },
  { to: '/doctors', label: 'Doctors', icon: Stethoscope },
  { to: '/pharmacies', label: 'Pharmacy', icon: Store },
  { to: '/orders', label: 'Orders', icon: ClipboardList },
  { to: '/profile', label: 'Profile', icon: UserRound },
];
