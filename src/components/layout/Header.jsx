import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ChevronDown, LogIn, LogOut, Menu, ShoppingBag, UserRound, X } from 'lucide-react';
import Logo from '../brand/Logo';
import LocationSelector from './LocationSelector';
import { ACCOUNT_NAV, DASHBOARD_NAV, PRIMARY_NAV } from './navigation';
import { selectSession } from '../../features/auth/authSlice';
import { selectCartCount } from '../../features/cart/cartSlice';
import { useLogout } from '../../hooks/useLogout';
import { maskPhone } from '../../utils/text';

function DrawerLinks({ title, items }) {
  return (
    <>
      <p className="drawer__label">{title}</p>
      <nav className="drawer__nav" aria-label={title}>
        {items.map(({ to, label, icon: Icon, end }) => (
          <NavLink key={to} to={to} end={end}>
            <Icon aria-hidden="true" />
            {label}
          </NavLink>
        ))}
      </nav>
    </>
  );
}

/** "My Account" menu with the patient pages and the demo dashboards. */
function AccountMenu({ phone, onLogout }) {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <div className="account-menu" onBlur={(e) => !e.currentTarget.contains(e.relatedTarget) && setOpen(false)}>
      <button
        type="button"
        className="site-nav__link account-menu__trigger"
        aria-expanded={open}
        aria-haspopup="true"
        onClick={() => setOpen((o) => !o)}
      >
        My Account <ChevronDown size={15} aria-hidden="true" />
      </button>
      {open && (
        <div className="account-menu__panel">
          <p className="account-menu__who">
            Signed in as <strong>+91 {maskPhone(phone)}</strong>
          </p>
          {ACCOUNT_NAV.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end}>
              <Icon size={16} aria-hidden="true" />
              {label}
            </NavLink>
          ))}
          <p className="account-menu__label">Demo dashboards</p>
          {DASHBOARD_NAV.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to}>
              <Icon size={16} aria-hidden="true" />
              {label}
            </NavLink>
          ))}
          <button type="button" className="account-menu__logout" onClick={onLogout}>
            <LogOut size={16} aria-hidden="true" />
            Logout
          </button>
        </div>
      )}
    </div>
  );
}

export default function Header() {
  const cartCount = useSelector(selectCartCount);
  const { phone } = useSelector(selectSession);
  const logout = useLogout();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => setDrawerOpen(false), [pathname]);
  useEffect(() => {
    if (!drawerOpen) return undefined;
    const onKey = (e) => e.key === 'Escape' && setDrawerOpen(false);
    document.addEventListener('keydown', onKey);
    // Keep the page behind the open menu from scrolling.
    const { overflow } = document.body.style;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = overflow;
    };
  }, [drawerOpen]);

  return (
    <header className="site-header">
      <div className="container site-header__inner">
        <Logo />
        <nav className="site-nav" aria-label="Main">
          {PRIMARY_NAV.map(({ to, label, end }) => (
            <NavLink key={to} to={to} end={end} className="site-nav__link">
              {label}
            </NavLink>
          ))}
          {phone && <AccountMenu phone={phone} onLogout={logout} />}
        </nav>
        <div className="header-actions">
          <div className="hide-sm">
            <LocationSelector compact />
          </div>
          {phone ? (
            <>
              <NavLink to="/cart" className="icon-btn" aria-label={`Cart, ${cartCount} items`}>
                <ShoppingBag aria-hidden="true" />
                {cartCount > 0 && <span className="icon-btn__count">{cartCount}</span>}
              </NavLink>
              <NavLink to="/profile" className="icon-btn icon-btn--avatar hide-sm" aria-label="Patient dashboard">
                <UserRound aria-hidden="true" />
              </NavLink>
            </>
          ) : (
            <Link to="/login" className="btn btn--primary btn--sm">
              <LogIn size={15} aria-hidden="true" />
              Login
            </Link>
          )}
          <button
            type="button"
            className="icon-btn menu-btn"
            onClick={() => setDrawerOpen(true)}
            aria-label="Open menu"
            aria-expanded={drawerOpen}
          >
            <Menu aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Portalled to <body>: the header's backdrop-filter would otherwise clip the fixed drawer to the header's height. */}
      {drawerOpen &&
        createPortal(
          <>
            <div className="drawer-backdrop" onClick={() => setDrawerOpen(false)} aria-hidden="true" />
            <div className="drawer" role="dialog" aria-modal="true" aria-label="Menu">
              <div className="cluster cluster--between">
                <Logo />
                <button type="button" className="icon-btn" onClick={() => setDrawerOpen(false)} aria-label="Close menu" autoFocus>
                  <X aria-hidden="true" />
                </button>
              </div>
              <LocationSelector />
              <DrawerLinks title="Explore" items={PRIMARY_NAV} />
              <DrawerLinks title="My account" items={ACCOUNT_NAV} />
              <DrawerLinks title="Demo dashboards" items={DASHBOARD_NAV} />
              {phone ? (
                <button type="button" className="btn btn--outline" onClick={logout}>
                  <LogOut size={16} aria-hidden="true" />
                  Logout (+91 {maskPhone(phone)})
                </button>
              ) : (
                <Link to="/login" className="btn btn--primary">
                  <LogIn size={16} aria-hidden="true" />
                  Login
                </Link>
              )}
            </div>
          </>,
          document.body,
        )}
    </header>
  );
}
