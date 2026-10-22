import { lazy } from 'react';
import { Route, Routes } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import RequireAuth from './components/layout/RequireAuth';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';

// Route-level code splitting; AppLayout shows a loader while a page chunk loads.
const FindDoctorsPage = lazy(() => import('./pages/FindDoctorsPage'));
const DoctorDetailsPage = lazy(() => import('./pages/DoctorDetailsPage'));
const HospitalsPage = lazy(() => import('./pages/HospitalsPage'));
const HospitalDetailsPage = lazy(() => import('./pages/HospitalDetailsPage'));
const BookAppointmentPage = lazy(() => import('./pages/BookAppointmentPage'));
const AppointmentDetailsPage = lazy(() => import('./pages/AppointmentDetailsPage'));
const MyAppointmentsPage = lazy(() => import('./pages/MyAppointmentsPage'));
const PharmaciesPage = lazy(() => import('./pages/PharmaciesPage'));
const PharmacyDetailsPage = lazy(() => import('./pages/PharmacyDetailsPage'));
const MedicinesPage = lazy(() => import('./pages/MedicinesPage'));
const ProductDetailsPage = lazy(() => import('./pages/ProductDetailsPage'));
const CartPage = lazy(() => import('./pages/CartPage'));
const CheckoutPage = lazy(() => import('./pages/CheckoutPage'));
const MyOrdersPage = lazy(() => import('./pages/MyOrdersPage'));
const OrderTrackingPage = lazy(() => import('./pages/OrderTrackingPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const ProfileDetailsPage = lazy(() => import('./pages/ProfileDetailsPage'));
const ProviderDashboardPage = lazy(() => import('./pages/ProviderDashboardPage'));
const PharmacyDashboardPage = lazy(() => import('./pages/PharmacyDashboardPage'));
const InfoPage = lazy(() => import('./pages/InfoPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

export default function App() {
  return (
    <Routes>
      <Route path="login" element={<LoginPage />} />
      <Route element={<AppLayout />}>
        {/* Public: legal, privacy and emergency information never require a login. */}
        <Route path="info/:topic" element={<InfoPage />} />
        <Route element={<RequireAuth />}>
          <Route index element={<HomePage />} />
          <Route path="doctors" element={<FindDoctorsPage />} />
          <Route path="doctors/:doctorId" element={<DoctorDetailsPage />} />
          <Route path="hospitals" element={<HospitalsPage />} />
          <Route path="hospitals/:hospitalId" element={<HospitalDetailsPage />} />
          <Route path="book" element={<BookAppointmentPage />} />
          <Route path="book/:doctorId" element={<BookAppointmentPage />} />
          <Route path="appointments" element={<MyAppointmentsPage />} />
          <Route path="appointments/:appointmentId" element={<AppointmentDetailsPage />} />
          <Route path="pharmacies" element={<PharmaciesPage />} />
          <Route path="pharmacies/:pharmacyId" element={<PharmacyDetailsPage />} />
          <Route path="medicines" element={<MedicinesPage />} />
          <Route path="medicines/:pharmacyId/:medicineId" element={<ProductDetailsPage />} />
          <Route path="cart" element={<CartPage />} />
          <Route path="checkout" element={<CheckoutPage />} />
          <Route path="orders" element={<MyOrdersPage />} />
          <Route path="orders/:orderId" element={<OrderTrackingPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="profile/details" element={<ProfileDetailsPage />} />
          <Route path="dashboard/provider" element={<ProviderDashboardPage />} />
          <Route path="dashboard/pharmacy" element={<PharmacyDashboardPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Route>
    </Routes>
  );
}
