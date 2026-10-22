import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { resetDemoData } from '../app/appActions';
import { useToast } from './useToast';

export function useResetDemo() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const toast = useToast();
  return () => {
    dispatch(resetDemoData());
    navigate('/');
    toast('Demo data reset', { message: 'Bookings, orders, cart and profile were restored to sample data.' });
  };
}
