'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { evaluateFaceFrame } from '@/lib/kyc/faceFrameCheck';

// What the live check can report back — the analyser's verdicts plus the two
// states only the hook knows about. `OK` is the only one that allows capture.
export const FACE_STATUS = Object.freeze({
  IDLE: 'IDLE',
  SEARCHING: 'SEARCHING',
  NO_FACE: 'NO_FACE',
  MULTIPLE: 'MULTIPLE',
  TOO_FAR: 'TOO_FAR',
  TOO_CLOSE: 'TOO_CLOSE',
  TOO_DARK: 'TOO_DARK',
  OK: 'OK',
});

export const FACE_STATUS_MESSAGE = Object.freeze({
  [FACE_STATUS.IDLE]: 'Enable your camera to begin.',
  [FACE_STATUS.SEARCHING]: 'Looking for your face...',
  [FACE_STATUS.NO_FACE]: 'No face detected — centre your face in the oval.',
  [FACE_STATUS.MULTIPLE]: 'More than one face detected — only you should be in frame.',
  [FACE_STATUS.TOO_FAR]: 'Move a little closer to the camera.',
  [FACE_STATUS.TOO_CLOSE]: 'Move back slightly — your whole face must fit the oval.',
  [FACE_STATUS.TOO_DARK]: 'Too dark — find brighter, even lighting.',
  [FACE_STATUS.OK]: 'Face detected — hold still and capture.',
});

const SAMPLE_INTERVAL_MS = 400;
// Two good samples in a row before the capture button unlocks, so a single
// lucky frame cannot pass the check.
const REQUIRED_STREAK = 2;
const ANALYSIS_SIZE = 96;

/**
 * Live "is there a proper face in frame" check for the selfie step.
 *
 * Uses the browser's FaceDetector (Shape Detection API) when it is available;
 * everywhere else it falls back to a skin-tone + brightness analysis of the
 * frame inside the on-screen oval. Neither path uploads anything: every pixel
 * is read from the local <video> element.
 *
 * @param {object} videoRef — ref to the live <video>
 * @param {boolean} active  — run the check only while the camera is live
 * @param {boolean} bypass  — demo camera: report OK without analysing
 */
export function useFaceCheck(videoRef, { active = false, bypass = false } = {}) {
  const [status, setStatus] = useState(FACE_STATUS.IDLE);
  const streakRef = useRef(0);
  const detectorRef = useRef(undefined);
  const canvasRef = useRef(null);
  const busyRef = useRef(false);

  const getDetector = useCallback(() => {
    if (detectorRef.current !== undefined) return detectorRef.current;
    detectorRef.current =
      typeof window !== 'undefined' && 'FaceDetector' in window
        ? new window.FaceDetector({ fastMode: true, maxDetectedFaces: 2 })
        : null;
    return detectorRef.current;
  }, []);

  /** Structure + skin-tone fallback, measured inside the guide oval. */
  const analyseFrame = useCallback((video) => {
    if (!canvasRef.current) canvasRef.current = document.createElement('canvas');
    const canvas = canvasRef.current;
    canvas.width = ANALYSIS_SIZE;
    canvas.height = ANALYSIS_SIZE;

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    const side = Math.min(video.videoWidth, video.videoHeight);
    ctx.drawImage(
      video,
      (video.videoWidth - side) / 2,
      (video.videoHeight - side) / 2,
      side,
      side,
      0,
      0,
      ANALYSIS_SIZE,
      ANALYSIS_SIZE
    );

    const { data } = ctx.getImageData(0, 0, ANALYSIS_SIZE, ANALYSIS_SIZE);
    return evaluateFaceFrame(data, ANALYSIS_SIZE).verdict;
  }, []);

  const sample = useCallback(async () => {
    const video = videoRef.current;
    if (!video || !video.videoWidth || busyRef.current) return;

    busyRef.current = true;
    try {
      const detector = getDetector();
      let next;

      if (detector) {
        const faces = await detector.detect(video).catch(() => null);
        if (faces === null) {
          // The detector failed on this device — fall back for good.
          detectorRef.current = null;
          next = analyseFrame(video);
        } else if (!faces.length) {
          next = FACE_STATUS.NO_FACE;
        } else if (faces.length > 1) {
          next = FACE_STATUS.MULTIPLE;
        } else {
          const box = faces[0].boundingBox;
          const side = Math.min(video.videoWidth, video.videoHeight);
          const ratio = Math.max(box.width, box.height) / side;
          next =
            ratio < 0.28
              ? FACE_STATUS.TOO_FAR
              : ratio > 0.95
                ? FACE_STATUS.TOO_CLOSE
                : FACE_STATUS.OK;
        }
      } else {
        next = analyseFrame(video);
      }

      streakRef.current = next === FACE_STATUS.OK ? streakRef.current + 1 : 0;
      setStatus(
        next === FACE_STATUS.OK && streakRef.current < REQUIRED_STREAK
          ? FACE_STATUS.SEARCHING
          : next
      );
    } finally {
      busyRef.current = false;
    }
  }, [analyseFrame, getDetector, videoRef]);

  useEffect(() => {
    streakRef.current = 0;
    let live = true;
    // Deferred a microtask so the first state update happens after the effect
    // body, not synchronously inside it.
    Promise.resolve().then(() => {
      if (!live) return;
      setStatus(bypass ? FACE_STATUS.OK : active ? FACE_STATUS.SEARCHING : FACE_STATUS.IDLE);
    });

    if (bypass || !active) return () => {
      live = false;
    };

    const timer = setInterval(sample, SAMPLE_INTERVAL_MS);
    return () => {
      live = false;
      clearInterval(timer);
    };
  }, [active, bypass, sample]);

  return {
    status,
    message: FACE_STATUS_MESSAGE[status],
    // The demo camera has no face to find, so it is always allowed through.
    isFaceReady: bypass || status === FACE_STATUS.OK,
  };
}

export default useFaceCheck;
