import { Link } from 'react-router-dom';
import Spinner from './Spinner';

/**
 * Renders a <Link> when `to` is given, otherwise a <button>.
 * `loading` disables the button and shows a spinner.
 */
export default function Button({
  to,
  variant = 'secondary',
  size,
  block = false,
  icon: Icon,
  iconRight: IconRight,
  loading = false,
  className = '',
  children,
  type = 'button',
  disabled,
  ...rest
}) {
  const classes = ['btn', `btn--${variant}`, size && `btn--${size}`, block && 'btn--block', className]
    .filter(Boolean)
    .join(' ');
  const iconSize = size === 'sm' ? 15 : 17;
  const content = (
    <>
      {loading ? <Spinner size="sm" /> : Icon && <Icon size={iconSize} aria-hidden="true" />}
      {children}
      {IconRight && <IconRight size={iconSize} aria-hidden="true" />}
    </>
  );

  if (to) {
    return (
      <Link to={to} className={classes} {...rest}>
        {content}
      </Link>
    );
  }
  return (
    <button type={type} className={classes} disabled={disabled || loading} aria-busy={loading || undefined} {...rest}>
      {content}
    </button>
  );
}
