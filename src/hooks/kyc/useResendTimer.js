'use client';

import { useCallback, useEffect, useState } from 'react';

/**
 * Countdown timer for OTP resend buttons.
 *
 *   const resend = useResendTimer(30);
 *   resend.start()      — starts / restarts the countdown
 *   resend.isDisabled   — true while counting down
 *   resend.timer        — remaining seconds
 */
export function useResendTimer(seconds = 30) {
  const [timer, setTimer] = useState(0);
  const [isDisabled, setIsDisabled] = useState(false);

  useEffect(() => {
    if (!isDisabled) return undefined;
    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setIsDisabled(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isDisabled]);

  const start = useCallback(() => {
    setTimer(seconds);
    setIsDisabled(true);
  }, [seconds]);

  return { timer, isDisabled, start };
}

export default useResendTimer;
