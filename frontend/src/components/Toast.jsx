import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export default function Toast({ toast, onClose }) {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      onClose();
    }, 4000);
    return () => clearTimeout(timer);
  }, [toast, onClose]);

  if (!toast) return null;

  const isSuccess = toast.type === 'success';
  const isError = toast.type === 'error';

  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className="fixed bottom-6 right-6 z-50 flex items-center gap-3 max-w-md px-4 py-3 rounded-xl shadow-2xl border transition-all animate-modal glass-surface text-cardFg border-borderToken"
    >
      {isSuccess && (
        <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" aria-hidden="true" />
      )}
      {isError && (
        <AlertCircle className="w-5 h-5 text-destructive shrink-0" aria-hidden="true" />
      )}
      {!isSuccess && !isError && (
        <Info className="w-5 h-5 text-primary shrink-0" aria-hidden="true" />
      )}

      <div className="text-sm font-medium pr-1">
        {toast.message}
      </div>

      <button
        type="button"
        onClick={onClose}
        className="inline-flex items-center justify-center min-h-[32px] min-w-[32px] p-1 text-mutedFg hover:text-foreground rounded-lg hover:bg-muted cursor-pointer transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ringToken shrink-0"
        aria-label="Dismiss notification"
      >
        <X className="w-4 h-4" aria-hidden="true" />
      </button>
    </div>
  );
}
