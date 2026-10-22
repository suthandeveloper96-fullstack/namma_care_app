import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectIsLoggedIn } from '../../features/auth/authSlice';

/** Route guard: sends signed-out users to /login and remembers where they were going. */
export default function RequireAuth() {
  const loggedIn = useSelector(selectIsLoggedIn);
  const location = useLocation();
  if (!loggedIn) {
    const from = `${location.pathname}${location.search}`;
    return <Navigate to="/login" replace state={{ from }} />;
  }
  return <Outlet />;
}
