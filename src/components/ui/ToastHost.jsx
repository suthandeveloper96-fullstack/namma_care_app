import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { X } from 'lucide-react';
import { selectToasts, toastDismissed } from '../../features/ui/uiSlice';

function Toast({ toast }) {
  const dispatch = useDispatch();
  useEffect(() => {
    const id = setTimeout(() => dispatch(toastDismissed(toast.id)), 5000);
    return () => clearTimeout(id);
  }, [dispatch, toast.id]);

  return (
    <div className={`toast toast--${toast.tone}`} role={toast.tone === 'danger' ? 'alert' : 'status'}>
      <div>
        <p className="toast__title">{toast.title}</p>
        {toast.message && <p className="toast__msg">{toast.message}</p>}
      </div>
      <button
        type="button"
        className="btn btn--ghost btn--icon btn--sm"
        onClick={() => dispatch(toastDismissed(toast.id))}
        aria-label="Dismiss notification"
      >
        <X size={16} aria-hidden="true" />
      </button>
    </div>
  );
}

export default function ToastHost() {
  const toasts = useSelector(selectToasts);
  return (
    <div className="toast-stack" aria-live="polite">
      {toasts.map((t) => (
        <Toast key={t.id} toast={t} />
      ))}
    </div>
  );
}
