import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logout } from '../features/auth/authThunks';
import { useToast } from './useToast';

export function useLogout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const toast = useToast();
  return () => {
    dispatch(logout());
    navigate('/login', { replace: true });
    toast('Logged out', { tone: 'info', message: 'Demo data stays in this browser until you reset it.' });
  };
}
