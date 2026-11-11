import React, { useEffect, useRef } from 'react';
import { AlertTriangle, ShieldAlert, Loader2, X } from 'lucide-react';

export default function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  employee,
  loading = false,
}) {
  const cancelBtnRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && !loading) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    // Default keyboard focus on Cancel to prevent accidental destructive deletion
    setTimeout(() => {
      cancelBtnRef.current?.focus();
    }, 20);

    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, loading, onClose]);

  if (!isOpen || !employee) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md transition-opacity"
      style={{ backgroundColor: 'var(--scrim-bg)' }}
      onClick={() => !loading && onClose()}
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-modal-title"
    >
      <div
        className="relative w-full max-w-md rounded-2xl bg-card border border-borderToken shadow-2xl p-6 text-cardFg animate-modal"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          disabled={loading}
          className="absolute right-4 top-4 inline-flex items-center justify-center min-h-[36px] min-w-[36px] p-1.5 rounded-xl text-mutedFg hover:text-foreground hover:bg-muted cursor-pointer transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ringToken"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" aria-hidden="true" />
        </button>

        {/* Warning Icon Badge */}
        <div
          className="w-12 h-12 rounded-2xl bg-destructive/10 border border-destructive/25 text-destructive flex items-center justify-center mb-4"
          aria-hidden="true"
        >
          <AlertTriangle className="w-6 h-6 stroke-[2.2]" />
        </div>

        {/* Title & Description */}
        <h3 id="delete-modal-title" className="text-lg font-bold tracking-tight text-cardFg mb-2">
          Delete Employee Record?
        </h3>

        <p className="text-sm text-mutedFg leading-relaxed mb-4">
          Are you sure you want to permanently remove{' '}
          <span className="font-semibold text-foreground underline decoration-destructive/60">
            {employee.name}
          </span>{' '}
          ({employee.role} in {employee.department}) from the employee database?
        </p>

        <div className="flex items-start gap-2.5 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 text-xs text-rose-800 dark:text-rose-200 mb-6">
          <ShieldAlert className="w-4 h-4 text-destructive shrink-0 mt-0.5" aria-hidden="true" />
          <span>
            This action is immediate and cannot be reversed. All associated record history will be removed.
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3">
          <button
            ref={cancelBtnRef}
            type="button"
            onClick={onClose}
            disabled={loading}
            className="min-h-[42px] px-4 py-2 rounded-xl border border-borderToken text-sm font-semibold text-foreground hover:bg-muted cursor-pointer transition-colors disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-ringToken"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="inline-flex items-center gap-2 min-h-[42px] px-4 py-2 rounded-xl bg-destructive hover:bg-red-700 dark:hover:bg-red-600 text-onDestructive text-sm font-semibold shadow-glow-danger cursor-pointer transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-destructive focus-visible:ring-offset-2 focus-visible:ring-offset-card"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />}
            <span>{loading ? 'Deleting Record...' : 'Confirm Deletion'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
