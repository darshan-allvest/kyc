'use client';

import { useMemo } from 'react';
import { cn } from '@/lib/utils';

// A deterministic, decorative QR-style block. It is not a scannable code — the
// demo has no payment gateway behind it — but it reads as one on screen.
const MODULES = 21;

const buildMatrix = (seed) => {
  const cells = [];
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) hash = (hash * 31 + seed.charCodeAt(i)) % 100000;

  for (let row = 0; row < MODULES; row += 1) {
    for (let column = 0; column < MODULES; column += 1) {
      // Leave the three finder-pattern corners free; fill the rest pseudo-randomly.
      const inFinder =
        (row < 7 && column < 7) ||
        (row < 7 && column >= MODULES - 7) ||
        (row >= MODULES - 7 && column < 7);
      if (inFinder) continue;

      hash = (hash * 1103515245 + 12345) % 2147483648;
      if ((hash >> 8) % 100 < 45) cells.push({ row, column });
    }
  }
  return cells;
};

const Finder = ({ x, y }) => (
  <>
    <rect x={x} y={y} width="7" height="7" fill="currentColor" />
    <rect x={x + 1} y={y + 1} width="5" height="5" fill="#ffffff" />
    <rect x={x + 2} y={y + 2} width="3" height="3" fill="currentColor" />
  </>
);

/**
 * KycUpiQr — decorative UPI QR block for the payment step.
 *
 * @param {string} value — UPI id the code stands for (also the pattern seed)
 */
export default function KycUpiQr({ value = 'demo@upi', className }) {
  const cells = useMemo(() => buildMatrix(value), [value]);

  return (
    <svg
      viewBox={`0 0 ${MODULES} ${MODULES}`}
      role="img"
      aria-label={`Decorative QR code for ${value}. This demo cannot take real payments.`}
      className={cn('size-40 rounded-lg bg-white p-1.5 text-black', className)}
    >
      <Finder x={0} y={0} />
      <Finder x={MODULES - 7} y={0} />
      <Finder x={0} y={MODULES - 7} />
      {cells.map((cell) => (
        <rect
          key={`${cell.row}-${cell.column}`}
          x={cell.column}
          y={cell.row}
          width="1"
          height="1"
          fill="currentColor"
        />
      ))}
    </svg>
  );
}
