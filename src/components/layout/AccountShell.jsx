import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { LogOut, RotateCcw, UserRound } from 'lucide-react';
import DashboardShell from './DashboardShell';
import { ACCOUNT_NAV } from './navigation';
import ConfirmDialog from '../ui/ConfirmDialog';
import { selectSession } from '../../features/auth/authSlice';
import { selectProfile } from '../../features/profile/profileSlice';
import { useLogout } from '../../hooks/useLogout';
import { useResetDemo } from '../../hooks/useResetDemo';
import { maskPhone } from '../../utils/text';

/** Sidebar layout for the patient's own pages (dashboard, appointments, orders, profile). */
export default function AccountShell({ children }) {
  const { pathname } = useLocation();
  const profile = useSelector(selectProfile);
  const { phone } = useSelector(selectSession);
  const reset = useResetDemo();
  const logout = useLogout();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const items = ACCOUNT_NAV.map((item) => ({
    ...item,
    active: item.end ? pathname === item.to : pathname.startsWith(item.to),
  }));

  return (
    <DashboardShell
      label="Patient account"
      items={items}
      identity={
        <>
          <span className="icon-tile icon-tile--round">
            <UserRound aria-hidden="true" />
          </span>
          <div>
            <p>{profile.name || 'Demo patient'}</p>
            <span>+91 {maskPhone(phone)}</span>
          </div>
        </>
      }
      footer={
        <>
          <button type="button" className="dash__link dash__link--button" onClick={() => setConfirmOpen(true)}>
            <RotateCcw size={17} aria-hidden="true" />
            <span>Reset demo data</span>
          </button>
          <button type="button" className="dash__link dash__link--button" onClick={logout}>
            <LogOut size={17} aria-hidden="true" />
            <span>Logout</span>
          </button>
        </>
      }
    >
      {children}
      <ConfirmDialog
        open={confirmOpen}
        title="Reset all demo data?"
        tone="danger"
        confirmLabel="Reset demo data"
        onCancel={() => setConfirmOpen(false)}
        onConfirm={() => {
          setConfirmOpen(false);
          reset();
        }}
      >
        Appointments, orders, cart, prescriptions, profile and dashboard changes in this browser will be replaced with the
        original sample data.
      </ConfirmDialog>
    </DashboardShell>
  );
}
