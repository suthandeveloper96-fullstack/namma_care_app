import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Database, Save } from 'lucide-react';
import Button from '../components/ui/Button';
import { SelectField, TextField, PhoneField } from '../components/ui/Field';
import AccountShell from '../components/layout/AccountShell';
import { LOCATIONS } from '../data/locations';
import { locationChanged, profileUpdated, selectProfile } from '../features/profile/profileSlice';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { useToast } from '../hooks/useToast';
import { validateAge, validateFields, validateName, validateOptional, validatePhone, validatePin } from '../utils/validation';

const PROFILE_SCHEMA = {
  name: validateName,
  age: validateAge,
  phone: validatePhone,
  line1: (v) => validateOptional(v, 'Address', { max: 160 }),
  city: (v) => validateOptional(v, 'City', { max: 60 }),
  pin: (v) => (String(v ?? '').trim() ? validatePin(v) : ''),
};

function ProfileForm({ profile }) {
  const dispatch = useDispatch();
  const toast = useToast();
  const [values, setValues] = useState(profile);
  const [errors, setErrors] = useState({});

  const setField = (field) => (e) => {
    setValues((v) => ({ ...v, [field]: e.target.value }));
    if (errors[field]) setErrors((errs) => ({ ...errs, [field]: '' }));
  };

  const submit = (event) => {
    event.preventDefault();
    const found = validateFields(values, PROFILE_SCHEMA);
    setErrors(found);
    if (Object.keys(found).length) return;
    dispatch(profileUpdated(values));
    dispatch(locationChanged(values.locationId));
    toast('Profile saved', { message: 'Stored only in this browser.' });
  };

  return (
    <form className="panel stack" onSubmit={submit} noValidate aria-labelledby="profile-form-heading">
      <h2 id="profile-form-heading" className="panel__title">
        Profile details
      </h2>
      <p className="text-sm muted">Used to prefill demo bookings and deliveries. No medical history is stored.</p>
      <div className="form-grid">
        <TextField label="Full name" required value={values.name} onChange={setField('name')} error={errors.name} autoComplete="name" />
        <TextField label="Age" required inputMode="numeric" maxLength={3} value={values.age} onChange={setField('age')} error={errors.age} />
        <PhoneField required value={values.phone} onChange={(value) => setField('phone')({ target: { value } })} error={errors.phone} />
        <SelectField
          label="Default area"
          value={values.locationId}
          onChange={setField('locationId')}
          options={LOCATIONS.map((l) => ({ value: l.id, label: `${l.area}, ${l.city}` }))}
          hint="Used to estimate distances"
        />
        <TextField label="Address" optional className="span-2" value={values.line1} onChange={setField('line1')} error={errors.line1} autoComplete="street-address" />
        <TextField label="City" optional value={values.city} onChange={setField('city')} error={errors.city} />
        <TextField
          label="PIN code"
          optional
          inputMode="numeric"
          maxLength={6}
          value={values.pin}
          onChange={(e) => setField('pin')({ target: { value: e.target.value.replace(/\D/g, '') } })}
          error={errors.pin}
        />
      </div>
      <div>
        <Button type="submit" variant="primary" icon={Save}>
          Save profile
        </Button>
      </div>
    </form>
  );
}

export default function ProfileDetailsPage() {
  useDocumentTitle('Profile');
  const profile = useSelector(selectProfile);
  return (
    <AccountShell>
      <header className="dash-header">
        <p className="eyebrow-text">My account</p>
        <h1>Profile</h1>
      </header>
      {/* Keyed so the form resets to stored values after a save or a demo reset. */}
      <ProfileForm key={JSON.stringify(profile)} profile={profile} />
      <section className="panel stack" aria-labelledby="privacy-heading">
        <h2 id="privacy-heading" className="panel__title">
          <Database size={17} aria-hidden="true" style={{ display: 'inline', marginRight: 8, verticalAlign: '-3px' }} />
          Your demo data
        </h2>
        <ul className="check-list">
          <li>Stored in this browser’s localStorage only.</li>
          <li>Never sent to a server, hospital or pharmacy.</li>
          <li>Prescription files are not saved — only their names.</li>
          <li>Other tabs in this browser stay in sync; other devices don’t.</li>
        </ul>
      </section>
    </AccountShell>
  );
}
