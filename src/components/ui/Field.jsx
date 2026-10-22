import { useId } from 'react';
import { CircleAlert } from 'lucide-react';
import { PHONE_DIGITS, sanitizePhoneInput } from '../../utils/validation';

function FieldShell({ id, label, optional, hint, error, className = '', children }) {
  return (
    <div className={`field ${className}`}>
      <label className="field__label" htmlFor={id}>
        {label}
        {optional && <span className="optional"> (optional)</span>}
      </label>
      {children}
      {hint && !error && (
        <p className="field__hint" id={`${id}-hint`}>
          {hint}
        </p>
      )}
      {error && (
        <p className="field__error" id={`${id}-error`} role="alert">
          <CircleAlert aria-hidden="true" />
          {error}
        </p>
      )}
    </div>
  );
}

function describedBy(id, hint, error) {
  if (error) return `${id}-error`;
  if (hint) return `${id}-hint`;
  return undefined;
}

export function TextField({ label, optional, hint, error, className, required, ...inputProps }) {
  const id = useId();
  return (
    <FieldShell id={id} label={label} optional={optional} hint={hint} error={error} className={className}>
      <input
        id={id}
        className="input"
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={describedBy(id, hint, error)}
        aria-required={required || undefined}
        {...inputProps}
      />
    </FieldShell>
  );
}

export function TextAreaField({ label, optional, hint, error, className, ...props }) {
  const id = useId();
  return (
    <FieldShell id={id} label={label} optional={optional} hint={hint} error={error} className={className}>
      <textarea
        id={id}
        className="textarea"
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={describedBy(id, hint, error)}
        {...props}
      />
    </FieldShell>
  );
}

export function SelectField({ label, hint, error, className, options, ...props }) {
  const id = useId();
  return (
    <FieldShell id={id} label={label} hint={hint} error={error} className={className}>
      <select
        id={id}
        className="select"
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={describedBy(id, hint, error)}
        {...props}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </FieldShell>
  );
}

/**
 * Indian mobile number input with a fixed +91 prefix. Only digits can be entered (typed, pasted
 * or autofilled) and the value is capped at 10 digits. `onChange` receives the cleaned string.
 */
export function PhoneField({ label = 'Mobile number', value, onChange, error, hint, required, className, autoFocus }) {
  const id = useId();
  return (
    <FieldShell id={id} label={label} hint={hint} error={error} className={className}>
      <div className={`phone-input${error ? ' phone-input--error' : ''}`}>
        <span className="phone-input__prefix" aria-hidden="true">
          +91
        </span>
        <input
          id={id}
          type="tel"
          inputMode="numeric"
          pattern="[0-9]*"
          autoComplete="tel-national"
          maxLength={PHONE_DIGITS}
          placeholder="10-digit mobile number"
          value={value}
          autoFocus={autoFocus}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={describedBy(id, hint, error)}
          aria-required={required || undefined}
          // Block non-digit keystrokes before they appear; onChange also cleans pasted text.
          onBeforeInput={(e) => {
            if (e.data && /D/.test(e.data)) e.preventDefault();
          }}
          onChange={(e) => onChange(sanitizePhoneInput(e.target.value))}
        />
      </div>
    </FieldShell>
  );
}
