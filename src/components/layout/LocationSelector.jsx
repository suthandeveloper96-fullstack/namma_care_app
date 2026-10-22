import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Check, ChevronDown, MapPin } from 'lucide-react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { TextField } from '../ui/Field';
import { LOCATIONS, findLocationByPin } from '../../data/locations';
import { locationChanged, selectLocation } from '../../features/profile/profileSlice';
import { useToast } from '../../hooks/useToast';

/** Lets the user pick a reference area or enter a PIN. Used only to simulate distances. */
export default function LocationSelector({ compact = false }) {
  const dispatch = useDispatch();
  const toast = useToast();
  const location = useSelector(selectLocation);
  const [open, setOpen] = useState(false);
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState('');

  const choose = (loc) => {
    dispatch(locationChanged(loc.id));
    setOpen(false);
    setPin('');
    setPinError('');
    toast(`Showing results near ${loc.area}, ${loc.city}`, { tone: 'info', message: 'Distances are approximate demo values.' });
  };

  const onPinSubmit = (event) => {
    event.preventDefault();
    if (!/^\d{6}$/.test(pin)) {
      setPinError('Enter a 6-digit PIN code.');
      return;
    }
    const match = findLocationByPin(pin);
    if (!match) {
      setPinError('This demo covers Chennai, Coimbatore, Madurai and Tiruchirappalli PIN codes.');
      return;
    }
    choose(match);
  };

  return (
    <>
      <button
        type="button"
        className={`location-trigger${compact ? ' location-trigger--compact' : ''}`}
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
      >
        <MapPin size={17} aria-hidden="true" />
        <span className="location-trigger__text">
          <span className="location-trigger__label">Near</span>
          <span className="location-trigger__value">
            {location.area}, {location.city}
          </span>
        </span>
        <ChevronDown size={16} aria-hidden="true" />
      </button>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Choose your area"
        description="Used only to estimate distances to demo facilities. NammaCare does not access your device location."
      >
        <form onSubmit={onPinSubmit} className="cluster" style={{ alignItems: 'flex-end', marginBottom: 'var(--s-5)' }} noValidate>
          <TextField
            label="PIN code"
            className="grow"
            inputMode="numeric"
            maxLength={6}
            placeholder="e.g. 600020"
            value={pin}
            error={pinError}
            onChange={(e) => {
              setPin(e.target.value.replace(/\D/g, ''));
              setPinError('');
            }}
          />
          <Button type="submit" variant="primary" style={{ marginBottom: pinError ? 26 : 0 }}>
            Use PIN
          </Button>
        </form>

        <p className="field__label" style={{ marginBottom: 8 }}>
          Or pick a demo area
        </p>
        <ul className="location-list">
          {LOCATIONS.map((loc) => {
            const active = loc.id === location.id;
            return (
              <li key={loc.id}>
                <button type="button" className="location-option" aria-pressed={active} onClick={() => choose(loc)}>
                  <span>
                    <strong>{loc.area}</strong>
                    <span className="subtle text-sm">
                      {' '}
                      · {loc.city} {loc.pin}
                    </span>
                  </span>
                  {active && <Check size={18} aria-hidden="true" />}
                </button>
              </li>
            );
          })}
        </ul>
      </Modal>
    </>
  );
}
