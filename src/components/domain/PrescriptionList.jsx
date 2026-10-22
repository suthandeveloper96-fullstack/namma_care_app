import { FileClock } from 'lucide-react';
import Badge from '../ui/Badge';
import { getPharmacyById } from '../../data/pharmacies';
import { formatDateTime } from '../../utils/format';

export const RX_STATUS_META = {
  pending: { label: 'Pending review (simulated)', tone: 'warning' },
  approved: { label: 'Approved (simulated)', tone: 'success' },
  rejected: { label: 'Rejected (simulated)', tone: 'danger' },
};

export default function PrescriptionList({ prescriptions }) {
  return (
    <ul className="rx-list">
      {prescriptions.map((rx) => (
        <li key={rx.id}>
          <FileClock size={18} aria-hidden="true" />
          <div style={{ flex: 1, minWidth: 0 }}>
            <p className="fw-600 text-sm" style={{ overflowWrap: 'anywhere' }}>
              {rx.fileName}
            </p>
            <p className="text-xs subtle">
              {getPharmacyById(rx.pharmacyId)?.name} · {formatDateTime(rx.submittedAt)}
            </p>
          </div>
          <Badge tone={RX_STATUS_META[rx.status].tone}>{RX_STATUS_META[rx.status].label}</Badge>
        </li>
      ))}
    </ul>
  );
}
