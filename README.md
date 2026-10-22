# NammaCare — Know Before You Go

A frontend-only healthcare prototype for Tamil Nadu: check **simulated** doctor availability, book demo appointments, and order pharmacy essentials with a simulated prescription-review flow.

> **Demo only.** All hospitals, doctors, pharmacies, prices, stock, bookings and orders are fictional and stored only in your browser's localStorage. Nothing is sent to any hospital, pharmacy, courier or payment provider. In an emergency, call **108** or **112**.

## Stack

React 19 · Vite · Redux Toolkit + React Redux · React Router 7 · Lucide icons · plain organised CSS (design tokens). No backend.

## Getting started

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # production build to dist/
npm run preview   # serve the production build
```

## Architecture

```
src/
  app/          store, root reducer (reset + cross-tab hydrate), persistence middleware
  features/     Redux slices + thunks (doctorStatus, appointments, cart, prescriptions,
                orders, inventory, profile, ui)
  data/         static fictional data (hospitals, doctors, pharmacies, medicines, seeds)
  utils/        pure business logic: booking rules, order state machine, inventory,
                validation, formatting, storage wrapper, references
  hooks/        view-model hooks (doctor views, listings, toasts, add-to-cart)
  components/   ui/ (design-system primitives), domain/ (cards, slot picker, timeline…),
                layout/ (header, footer, navigation), brand/
  pages/        one component per route (lazy-loaded)
  i18n/         string table, ready for a Tamil dictionary
  styles/       tokens, base, components, layout, pages
```

### Key rules
- **Availability honesty:** every status shows its last-update time; statuses older than 2 hours are displayed as "Status Unknown".
- **Booking:** 14-day window, 15-minute lead time, duplicate doctor/date/time bookings are rejected (re-checked at confirm time, including across tabs).
- **Prescriptions:** Rx items lock checkout until a *simulated* pharmacist approval (in-cart prototype control or pharmacy dashboard). Files are validated (JPG/PNG/WEBP/PDF, ≤5 MB) and previewed in memory only — never stored.
- **Orders:** strict status transitions; stock is reserved on order and released on rejection/cancellation.
- **Persistence:** versioned localStorage envelopes, sanitised on load (malformed data falls back to seed), synced across tabs via the `storage` event. "Reset demo data" is in the footer and profile.

## Routes

`/` · `/doctors` · `/doctors/:id` · `/hospitals` · `/hospitals/:id` · `/book/:doctorId?` · `/appointments` · `/appointments/:id` · `/pharmacies` · `/pharmacies/:id` · `/medicines` · `/medicines/:pharmacyId/:medicineId` · `/cart` · `/checkout` · `/orders` · `/orders/:id` · `/profile` · `/dashboard/provider` · `/dashboard/pharmacy` · `/info/:topic`
# namma_care_app
