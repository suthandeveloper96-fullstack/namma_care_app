import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { PHARMACIES, STATIC_LISTINGS } from '../data/pharmacies';
import { selectInventory } from '../features/inventory/inventorySlice';
import { selectLocation } from '../features/profile/profileSlice';
import { distanceKm } from '../utils/geo';
import { resolveListing, stockLevel } from '../utils/inventory';

/** All listings resolved against live demo inventory, each with its pharmacy distance. */
export function useListings() {
  const inventory = useSelector(selectInventory);
  const origin = useSelector(selectLocation);
  return useMemo(
    () =>
      STATIC_LISTINGS.map((l) => {
        const listing = resolveListing(inventory, l.pharmacyId, l.medicineId);
        return { ...listing, distanceKm: distanceKm(origin, listing.pharmacy) };
      }),
    [inventory, origin],
  );
}

/** Pharmacies with distance and stock counts. */
export function usePharmacySummaries() {
  const listings = useListings();
  const origin = useSelector(selectLocation);
  return useMemo(
    () =>
      PHARMACIES.map((pharmacy) => {
        const own = listings.filter((l) => l.pharmacyId === pharmacy.id);
        return {
          pharmacy,
          distanceKm: distanceKm(origin, pharmacy),
          totalListed: own.length,
          inStockCount: own.filter((l) => stockLevel(l) !== 'out').length,
        };
      }).sort((a, b) => a.distanceKm - b.distanceKm),
    [listings, origin],
  );
}
