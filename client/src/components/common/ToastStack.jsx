import { useDispatch, useSelector } from 'react-redux';
import { removeToast } from '../../features/ui/uiSlice.js';
import { useEffect, memo } from 'react';

const ToastItem = memo(function ToastItem({ toast, onDismiss }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(toast.id);
    }, 3800);
    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  const isError = toast.type === 'error';
  const isWarning = toast.type === 'warning';

  return (
    <div
      role="alert"
      className={`flex items-start justify-between gap-3 min-w-[280px] max-w-md rounded-lg border px-4 py-3 text-sm shadow-panel transition-all transform animate-fadeIn ${
        isError
          ? 'border-solar-error/30 bg-red-50/95 text-solar-error'
          : isWarning
          ? 'border-amber-400/40 bg-amber-50/95 text-amber-800'
          : 'border-solar-green/30 bg-emerald-50/95 text-solar-green'
      }`}
    >
      <div className="flex items-center gap-2">
        <span className="font-semibold text-base leading-none">
          {isError ? '✕' : isWarning ? '⚠' : '✓'}
        </span>
        <span className="font-medium leading-snug">{toast.message}</span>
      </div>
      <button
        type="button"
        onClick={() => onDismiss(toast.id)}
        className="ml-2 -mr-1 -mt-0.5 text-solar-slate-400 hover:text-solar-slate-700 text-lg font-bold leading-none p-1 rounded hover:bg-black/5 transition-colors"
        aria-label="Close notification"
      >
        &times;
      </button>
    </div>
  );
});

export default function ToastStack() {
  const toasts = useSelector((s) => s.ui.toasts);
  const dispatch = useDispatch();

  const handleDismiss = (id) => {
    dispatch(removeToast(id));
  };

  return (
    <div className="fixed right-4 top-4 z-[100] flex flex-col gap-2 pointer-events-none">
      {toasts.slice(-5).map((t) => (
        <div key={t.id} className="pointer-events-auto">
          <ToastItem toast={t} onDismiss={handleDismiss} />
        </div>
      ))}
    </div>
  );
}
