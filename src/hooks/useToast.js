import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { toastShown } from '../features/ui/uiSlice';

export function useToast() {
  const dispatch = useDispatch();
  return useCallback((title, { message = '', tone = 'success' } = {}) => dispatch(toastShown({ title, message, tone })), [dispatch]);
}
