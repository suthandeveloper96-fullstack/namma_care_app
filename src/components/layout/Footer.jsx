import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FlaskConical, Siren } from 'lucide-react';
import ConfirmDialog from '../ui/ConfirmDialog';
import { useResetDemo } from '../../hooks/useResetDemo';

export default function Footer() {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const reset = useResetDemo();

  return (
    <footer className="site-footer">
      <div className="container site-footer__inner">
        <p className="site-footer__demo">
          <FlaskConical size={15} aria-hidden="true" />
          Demo data only. Not a real booking. Not connected to real hospitals, pharmacies or delivery services.
        </p>
        <nav className="site-footer__links" aria-label="Footer">
          <Link to="/info/about">About Us</Link>
          <Link to="/info/privacy">Privacy Policy</Link>
          <Link to="/info/terms">Terms &amp; Conditions</Link>
          <Link to="/info/contact">Contact</Link>
          <button type="button" className="link-button" onClick={() => setConfirmOpen(true)}>
            Reset demo data
          </button>
          <Link to="/info/emergency" className="site-footer__emergency">
            <Siren size={15} aria-hidden="true" />
            Emergency: Call 108
          </Link>
        </nav>
      </div>

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
        This clears your demo appointments, orders, cart, prescription uploads, profile edits and dashboard changes stored in
        this browser, then restores the original sample data.
      </ConfirmDialog>
    </footer>
  );
}
