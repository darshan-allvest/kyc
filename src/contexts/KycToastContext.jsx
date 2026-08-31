'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { X } from 'lucide-react';
import KycAlert from '@/components/kyc/KycAlert';

const KycToastContext = createContext(null);

// How long a toast stays up before it clears itself.
const TOAST_DURATION = 5000;

/**
 * KycToastProvider — transient status messages for the KYC flow. Toasts live
 * above the step router, so they survive a step change or a flow reset and the
 * applicant still reads why they were sent back.
 */
export function KycToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  // Timers are cleared on unmount so a reset mid-countdown cannot fire late.
  const timers = useRef(new Map());

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
    const timer = timers.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timers.current.delete(id);
    }
  }, []);

  const showToast = useCallback(
    ({ tone = 'info', title, message, duration = TOAST_DURATION }) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      setToasts((prev) => [...prev, { id, tone, title, message }]);
      timers.current.set(
        id,
        setTimeout(() => dismissToast(id), duration)
      );
      return id;
    },
    [dismissToast]
  );

  useEffect(() => {
    const pending = timers.current;
    return () => {
      pending.forEach((timer) => clearTimeout(timer));
      pending.clear();
    };
  }, []);

  const value = useMemo(() => ({ showToast, dismissToast }), [showToast, dismissToast]);

  return (
    <KycToastContext.Provider value={value}>
      {children}

      {/* KycAlert carries role="alert"/"status", so it announces itself — no
          aria-live wrapper here, or every toast is read out twice. */}
      <div className="pointer-events-none fixed inset-x-4 top-4 z-[100] flex flex-col items-center gap-2 sm:inset-x-0">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            // The slide-in keyframes in globals.css are keyed off data-state.
            data-state="open"
            className="animate-slide-in-top pointer-events-auto relative w-full max-w-md"
          >
            <KycAlert
              tone={toast.tone}
              title={toast.title}
              className="pr-10 shadow-lg backdrop-blur-sm"
            >
              {toast.message}
            </KycAlert>
            <button
              type="button"
              onClick={() => dismissToast(toast.id)}
              aria-label="Dismiss notification"
              className="absolute right-2 top-2 flex size-7 items-center justify-center rounded-md text-homepage-darkGrey transition-colors hover:bg-white/10 hover:text-white"
            >
              <X className="size-4" />
            </button>
          </div>
        ))}
      </div>
    </KycToastContext.Provider>
  );
}

export function useKycToastContext() {
  const context = useContext(KycToastContext);
  if (!context)
    throw new Error('useKycToastContext must be used inside <KycToastProvider>');
  return context;
}

export default KycToastContext;
