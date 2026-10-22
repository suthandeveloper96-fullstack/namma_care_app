import { Link, useParams } from 'react-router-dom';
import { FileText, FlaskConical, Mail, ShieldCheck, Siren } from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';
import Alert from '../components/ui/Alert';
import Button from '../components/ui/Button';
import { ErrorState } from '../components/ui/EmptyState';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

const TOPICS = {
  about: {
    icon: FlaskConical,
    title: 'How this demo works',
    intro: 'NammaCare is a frontend-only portfolio prototype. Everything you see is simulated.',
    sections: [
      ['Fictional data', 'All hospitals, clinics, doctors, pharmacies, prices and stock levels are invented. Any resemblance to real organisations or people is coincidental.'],
      ['Simulated availability', 'Doctor statuses are sample values that can be changed from the provider dashboard. Every status shows when it was last updated, and anything older than 2 hours is shown as “Status Unknown”.'],
      ['Local storage only', 'Appointments, orders, cart, prescription metadata, inventory changes and your profile are saved in this browser’s localStorage. Open tabs stay in sync through the browser’s storage event. Nothing is shared with other users or devices.'],
      ['Distances', 'Distances are straight-line estimates from the area you select. The app never reads your device location.'],
      ['Resetting', 'Use “Reset demo data” in the footer or on your profile to restore the original sample data at any time.'],
    ],
  },
  emergency: {
    icon: Siren,
    title: 'Emergency disclaimer',
    intro: 'NammaCare is not an emergency service and must never be relied on in an emergency.',
    sections: [
      ['Call for help immediately', 'For a medical emergency in India, call 108 for an ambulance or 112 for emergency services, or go to the nearest hospital casualty department.'],
      ['No diagnosis or advice', 'This app does not diagnose conditions, triage symptoms, or recommend medicines. Always consult a qualified doctor or pharmacist.'],
      ['Availability is not guaranteed', 'Statuses and slots are simulated demo data. They do not reflect whether any real doctor or facility is available.'],
    ],
  },
  privacy: {
    icon: ShieldCheck,
    title: 'Privacy',
    intro: 'This demo is designed to collect as little as possible — and nothing leaves your browser.',
    sections: [
      ['What is stored', 'Your demo profile (name, age, mobile number, optional address and PIN), demo appointments, orders, cart and prescription file names/sizes. No medical history, diagnoses or documents are stored.'],
      ['Prescription files', 'Selected files are validated and previewed in memory only. Their contents are never uploaded or saved. Please use sample images, not real prescriptions.'],
      ['Where it is stored', 'In localStorage on this device and browser profile. There is no server, analytics or third-party sharing in this prototype.'],
      ['Deleting your data', 'Use “Reset demo data” to clear and restore sample data, or clear site data in your browser settings.'],
    ],
  },
  terms: {
    icon: FileText,
    title: 'Terms of use',
    intro: 'By using this prototype you acknowledge the following.',
    sections: [
      ['Demonstration only', 'NammaCare is a portfolio project. It does not provide medical, pharmacy, booking, payment or delivery services.'],
      ['No real transactions', 'Bookings and orders are simulated. No payment is collected, no prescription is approved, and nothing is dispensed or delivered.'],
      ['No partnerships', 'No hospital, doctor, pharmacy or courier participates in or endorses this demo.'],
      ['No warranty', 'The prototype is provided as-is for evaluation purposes.'],
    ],
  },
  contact: {
    icon: Mail,
    title: 'Contact',
    intro: 'NammaCare is a demo without a support desk.',
    sections: [
      ['Feedback on the prototype', 'Please share feedback through the channel where you found this portfolio project.'],
      ['Medical help', 'Contact a local doctor, hospital or pharmacist directly. In an emergency, call 108 or 112.'],
    ],
  },
};

export default function InfoPage() {
  const { topic } = useParams();
  const content = TOPICS[topic];
  useDocumentTitle(content?.title ?? 'Page not found');

  if (!content) {
    return (
      <div className="container page">
        <ErrorState title="Page not found" actions={<Button to="/" variant="primary">Go home</Button>}>
          This information page doesn’t exist.
        </ErrorState>
      </div>
    );
  }

  return (
    <div className="container page narrow">
      <PageHeader eyebrow="NammaCare demo" eyebrowIcon={content.icon} title={content.title} description={content.intro} />
      {topic === 'emergency' && (
        <Alert tone="danger" title="In an emergency, call 108 or 112 now." className="mb-6">
          Do not wait for an online booking or delivery.
        </Alert>
      )}
      <div className="card card--pad-lg stack stack--lg prose">
        {content.sections.map(([heading, body]) => (
          <section key={heading}>
            <h2>{heading}</h2>
            <p>{body}</p>
          </section>
        ))}
      </div>
      <p className="text-sm muted mt-4">
        See also: <Link to="/info/about">How the demo works</Link> · <Link to="/info/privacy">Privacy</Link> ·{' '}
        <Link to="/info/terms">Terms</Link> · <Link to="/info/emergency">Emergency disclaimer</Link>
      </p>
    </div>
  );
}
