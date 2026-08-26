'use client';

import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import Text from '@/components/common/Text';
import Spinner from '@/components/ui/Spinner';
import KycAlert from '@/components/kyc/KycAlert';
import { KYC_TYPO } from '@/constants/kycConstants';
import { KRA_FORM } from '@/lib/kyc/downloadKycPdf';

// Rendered at 2× so the sheets stay sharp on high-density screens.
const SCALE = 2;

/**
 * KraFormPages — the first KRA_FORM.pageCount pages of the CVL KRA KYC form,
 * drawn onto canvases so they read as sheets of the same document rather than
 * an embedded PDF viewer.
 */
export default function KraFormPages({ className }) {
  const containerRef = useRef(null);
  const [count, setCount] = useState(0);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    (async () => {
      try {
        const pdfjs = await import('pdfjs-dist/build/pdf.mjs');
        pdfjs.GlobalWorkerOptions.workerSrc = '/assets/pdf.worker.min.mjs';

        const doc = await pdfjs.getDocument(KRA_FORM.src).promise;
        const total = Math.min(KRA_FORM.pageCount, doc.numPages);
        if (!active) return;
        setCount(total);

        for (let number = 1; number <= total; number += 1) {
          const page = await doc.getPage(number);
          if (!active) return;

          const canvas = containerRef.current?.querySelector(`[data-kra-page="${number}"]`);
          if (!canvas) continue;

          const viewport = page.getViewport({ scale: SCALE });
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          await page.render({ canvasContext: canvas.getContext('2d'), viewport }).promise;
        }
      } catch {
        if (active) setError('The KRA form could not be loaded.');
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  if (error) return <KycAlert tone="error" className={className}>{error}</KycAlert>;

  return (
    <div ref={containerRef} className={cn('space-y-4', className)}>
      {count === 0 && (
        <div className="flex items-center gap-3 py-6" role="status" aria-live="polite">
          <Spinner className="size-4 text-brand-500" />
          <Text className={KYC_TYPO.body} color="text-gray-600 dark:text-homepage-lightWhite">
            Loading the KRA form...
          </Text>
        </div>
      )}

      {Array.from({ length: count }, (_, index) => (
        <canvas
          key={index}
          data-kra-page={index + 1}
          role="img"
          aria-label={`CVL KRA KYC form, page ${index + 1} of ${count}`}
          className="w-full rounded-xl bg-white shadow-sm ring-1 ring-black/5"
        />
      ))}
    </div>
  );
}
