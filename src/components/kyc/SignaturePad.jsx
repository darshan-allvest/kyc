'use client';

import { useCallback, useEffect, useImperativeHandle, useRef, useState, forwardRef } from 'react';
import { cn } from '@/lib/utils';

/**
 * SignaturePad — canvas signature capture with mouse, touch and stylus support.
 *
 * Exposes `clear()`, `isEmpty()` and `toDataURL()` via ref. The drawing never
 * leaves the component; the parent decides what to do with the data URL.
 *
 * @param {Function} [onChange] — (hasInk: boolean) => void
 * @param {number}   [height]   — CSS height in px (default 180)
 */
const SignaturePad = forwardRef(function SignaturePad(
  { onChange, height = 180, className, ariaLabel = 'Signature drawing area' },
  ref
) {
  const canvasRef = useRef(null);
  const drawingRef = useRef(false);
  const hasInkRef = useRef(false);
  const [ready, setReady] = useState(false);

  // Size the bitmap to the element's CSS box × DPR so strokes stay crisp and
  // pointer coordinates map 1:1.
  const resize = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    const snapshot = hasInkRef.current ? canvas.toDataURL() : null;

    canvas.width = Math.round(rect.width * dpr);
    canvas.height = Math.round(rect.height * dpr);

    const ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.lineWidth = 2.2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#FFFFFF';

    if (snapshot) {
      const image = new window.Image();
      image.onload = () => ctx.drawImage(image, 0, 0, rect.width, rect.height);
      image.src = snapshot;
    }
    setReady(true);
  }, []);

  useEffect(() => {
    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, [resize]);

  const pointFrom = (event) => {
    const rect = canvasRef.current.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  };

  const handlePointerDown = (event) => {
    event.preventDefault();
    const ctx = canvasRef.current.getContext('2d');
    const { x, y } = pointFrom(event);
    drawingRef.current = true;
    ctx.beginPath();
    ctx.moveTo(x, y);
    canvasRef.current.setPointerCapture?.(event.pointerId);
  };

  const handlePointerMove = (event) => {
    if (!drawingRef.current) return;
    event.preventDefault();
    const ctx = canvasRef.current.getContext('2d');
    const { x, y } = pointFrom(event);
    ctx.lineTo(x, y);
    ctx.stroke();

    if (!hasInkRef.current) {
      hasInkRef.current = true;
      onChange?.(true);
    }
  };

  const handlePointerUp = (event) => {
    if (!drawingRef.current) return;
    drawingRef.current = false;
    canvasRef.current.releasePointerCapture?.(event.pointerId);
  };

  const clear = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    ctx.clearRect(0, 0, rect.width, rect.height);
    hasInkRef.current = false;
    onChange?.(false);
  }, [onChange]);

  useImperativeHandle(
    ref,
    () => ({
      clear,
      isEmpty: () => !hasInkRef.current,
      /** Flattens the strokes onto a solid background so the PDF stays readable. */
      toDataURL: (background = '#FFFFFF', ink = '#111111') => {
        const canvas = canvasRef.current;
        if (!canvas || !hasInkRef.current) return null;

        const out = document.createElement('canvas');
        out.width = canvas.width;
        out.height = canvas.height;
        const ctx = out.getContext('2d');
        // The live canvas holds white ink on a transparent background; recolour
        // the ink, then lay a solid background behind it for the document.
        ctx.drawImage(canvas, 0, 0);
        ctx.globalCompositeOperation = 'source-in';
        ctx.fillStyle = ink;
        ctx.fillRect(0, 0, out.width, out.height);
        ctx.globalCompositeOperation = 'destination-over';
        ctx.fillStyle = background;
        ctx.fillRect(0, 0, out.width, out.height);
        return out.toDataURL('image/jpeg', 0.92);
      },
    }),
    [clear]
  );

  return (
    <canvas
      ref={canvasRef}
      role="img"
      aria-label={ariaLabel}
      style={{ height, touchAction: 'none' }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      onPointerCancel={handlePointerUp}
      className={cn(
        // Always a dark surface: the ink is white, so the pad must not follow
        // the light theme or the strokes would be invisible.
        'w-full cursor-crosshair rounded-xl border border-dashed bg-container-black',
        ready ? 'border-gray-300 dark:border-homepage-borderColor' : 'border-transparent',
        className
      )}
    />
  );
});

export default SignaturePad;
