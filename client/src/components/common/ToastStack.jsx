import { useDispatch, useSelector } from 'react-redux';
import { removeToast } from '../../features/ui/uiSlice.js';
import { useEffect } from 'react';

export default function ToastStack() {
  const toasts = useSelector((s) => s.ui.toasts);
  const dispatch = useDispatch();

  useEffect(() => {
    const timers = toasts.map((t) => setTimeout(() => dispatch(removeToast(t.id)), 4200));
    return () => timers.forEach(clearTimeout);
  }, [toasts, dispatch]);

  return (
    <div className="fixed right-4 top-4 z-[60] space-y-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`min-w-[240px] rounded-lg border px-4 py-3 text-sm shadow-panel ${
            t.type === 'error'
              ? 'border-solar-error bg-white text-solar-error'
              : 'border-solar-success bg-white text-solar-success'
          }`}
        >
          {t.message}
        </div>
      ))}
    </div>
  );
}
