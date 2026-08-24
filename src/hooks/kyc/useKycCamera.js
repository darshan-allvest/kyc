'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { PERMISSION_STATE } from '@/constants/kycConstants';
import { getKycTestConfig } from '@/services/kyc/kycTestConfig';

/**
 * Front-camera access for the selfie step.
 *
 * Handles all four states the tester needs — loading, active, denied and
 * unavailable — and can be forced into any of them from the demo switchboard
 * (`cameraOutcome`, `useRealDeviceCamera`) so the negative cases are testable
 * without changing browser settings. The captured frame never leaves the page.
 */
export function useKycCamera() {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [permission, setPermission] = useState(PERMISSION_STATE.IDLE);
  const [error, setError] = useState('');
  // True when the demo runs without a real device camera (switchboard option),
  // so the UI can label the frame instead of showing an empty black box.
  const [isMock, setIsMock] = useState(false);

  const stop = useCallback(() => {
    streamRef.current?.getTracks?.().forEach((track) => track.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
  }, []);

  const start = useCallback(async () => {
    const { cameraOutcome, useRealDeviceCamera } = getKycTestConfig();
    setError('');
    setIsMock(!useRealDeviceCamera);

    if (cameraOutcome === PERMISSION_STATE.DENIED) {
      setPermission(PERMISSION_STATE.DENIED);
      setError('Camera permission was denied. Allow camera access to take a selfie.');
      return false;
    }
    if (cameraOutcome === PERMISSION_STATE.UNAVAILABLE) {
      setPermission(PERMISSION_STATE.UNAVAILABLE);
      setError('No camera was found on this device.');
      return false;
    }
    if (!useRealDeviceCamera) {
      setPermission(PERMISSION_STATE.GRANTED);
      return true;
    }
    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      setPermission(PERMISSION_STATE.UNAVAILABLE);
      setError('This browser does not support camera capture.');
      return false;
    }

    setPermission(PERMISSION_STATE.PROMPTING);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 720 }, height: { ideal: 720 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => {});
      }
      setPermission(PERMISSION_STATE.GRANTED);
      return true;
    } catch (err) {
      const denied = err?.name === 'NotAllowedError' || err?.name === 'SecurityError';
      setPermission(denied ? PERMISSION_STATE.DENIED : PERMISSION_STATE.UNAVAILABLE);
      setError(
        denied
          ? 'Camera permission was denied. Allow camera access in your browser to continue.'
          : 'We could not start your camera. Check that no other app is using it.'
      );
      return false;
    }
  }, []);

  /** Grabs the current frame as a JPEG data URL (kept in React state only). */
  const capture = useCallback(() => {
    const video = videoRef.current;
    const { useRealDeviceCamera } = getKycTestConfig();

    if (!useRealDeviceCamera || !video || !video.videoWidth) {
      return createMockSelfie();
    }

    const size = Math.min(video.videoWidth, video.videoHeight);
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    // Mirror horizontally so the saved selfie matches the on-screen preview.
    ctx.translate(size, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(
      video,
      (video.videoWidth - size) / 2,
      (video.videoHeight - size) / 2,
      size,
      size,
      0,
      0,
      size,
      size
    );
    return canvas.toDataURL('image/jpeg', 0.85);
  }, []);

  useEffect(() => stop, [stop]);

  return { videoRef, permission, error, isMock, start, stop, capture };
}

/**
 * Placeholder selfie drawn on a canvas — used when the demo runs without a real
 * device camera so the preview, the final document and the PDF all still work.
 */
function createMockSelfie() {
  if (typeof document === 'undefined') return '';
  const size = 480;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#202020';
  ctx.fillRect(0, 0, size, size);
  ctx.fillStyle = '#99CC00';
  ctx.beginPath();
  ctx.arc(size / 2, size * 0.38, size * 0.15, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(size / 2, size * 1.05, size * 0.42, Math.PI, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#FFFFFF';
  ctx.font = '500 22px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('TEST SELFIE', size / 2, size - 28);

  return canvas.toDataURL('image/jpeg', 0.85);
}

export default useKycCamera;
