import { useState } from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { CalendarCheck, FlaskConical, LogIn, Pill, ShieldCheck, Siren, Stethoscope } from 'lucide-react';
import Button from '../components/ui/Button';
import { PhoneField } from '../components/ui/Field';
import Logo from '../components/brand/Logo';
import { LOGIN_PHOTO } from '../data/doctorPhotos';
import { selectIsLoggedIn } from '../features/auth/authSlice';
import { loginWithMobile } from '../features/auth/authThunks';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { useToast } from '../hooks/useToast';

const HIGHLIGHTS = [
  { icon: Stethoscope, text: 'Find nearby doctors' },
  { icon: Pill, text: 'Order medicines easily' },
  { icon: CalendarCheck, text: 'Book appointments online' },
];

/** Only allow in-app paths as the post-login destination. */
function safeDestination(from) {
  return typeof from === 'string' && from.startsWith('/') && !from.startsWith('//') && !from.startsWith('/login') ? from : '/';
}

export default function LoginPage() {
  useDocumentTitle('Login');
  const dispatch = useDispatch();
  const toast = useToast();
  const location = useLocation();
  const loggedIn = useSelector(selectIsLoggedIn);
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const destination = safeDestination(location.state?.from);

  // Once signed in (including right after submitting), continue to the requested page.
  if (loggedIn) return <Navigate to={destination} replace />;

  const submit = (event) => {
    event.preventDefault();
    setError('');
    setSubmitting(true);
    // Brief delay so the loading state is visible, as with a real sign-in request.
    setTimeout(() => {
      const result = dispatch(loginWithMobile(phone));
      setSubmitting(false);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      toast('Logged in', { message: `Welcome! Signed in as +91 ${result.phone}` });
    }, 500);
  };

  return (
    <div className="login">
      <div className="login__photo" aria-hidden="true">
        <img src={LOGIN_PHOTO} alt="" />
      </div>

      <aside className="login__pitch" aria-hidden="true">
        <h2>
          Your Health,
          <br />
          Our Priority
        </h2>
        <ul className="login__highlights">
          {HIGHLIGHTS.map(({ icon: Icon, text }) => (
            <li key={text}>
              <span className="login__highlight-icon">
                <Icon />
              </span>
              {text}
            </li>
          ))}
        </ul>
        <p className="login__photo-note">Representative image · demo app</p>
      </aside>

      <main className="login__main" id="main">
        <form className="login-card" onSubmit={submit} noValidate aria-labelledby="login-title">
          <div className="login-card__logo">
            <Logo />
          </div>
          <div>
            <h1 id="login-title">Welcome back</h1>
            <p className="text-sm muted">Enter your mobile number to continue.</p>
          </div>

          <PhoneField
            required
            autoFocus
            value={phone}
            error={error}
            hint="Indian mobile numbers starting with 6, 7, 8 or 9. Digits only."
            onChange={(value) => {
              setPhone(value);
              if (error) setError('');
            }}
          />

          <Button type="submit" variant="primary" size="lg" block icon={LogIn} loading={submitting}>
            {submitting ? 'Logging in…' : 'Login'}
          </Button>

          <div className="login-card__note">
            <FlaskConical size={16} aria-hidden="true" />
            <p>
              <strong>Demo login.</strong> No OTP or SMS is sent and there is no server account — your number is only checked for
              a valid format and remembered in this browser.
            </p>
          </div>

          <p className="login-card__legal">
            <ShieldCheck size={14} aria-hidden="true" />
            <span>
              By continuing you agree to the <Link to="/info/terms">Terms</Link> and{' '}
              <Link to="/info/privacy">Privacy Policy</Link>.
            </span>
          </p>
        </form>

        <Link to="/info/emergency" className="login__emergency">
          <Siren size={15} aria-hidden="true" />
          Medical emergency? Call 108 or 112 — no login needed.
        </Link>
      </main>
    </div>
  );
}
