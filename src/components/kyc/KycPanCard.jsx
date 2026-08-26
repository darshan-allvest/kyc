'use client';

import Image from 'next/image';
import { cn } from '@/lib/utils';

const TEMPLATE_SRC = '/assets/img/pan-card-template.png';

// Where each value sits on the template, as a share of the card. The template
// already carries every printed label, so only the values are overlaid.
const SLOTS = {
  pan: { left: '31.5%', top: '54.5%', className: 'tracking-[0.14em]' },
  name: { left: '4.5%', top: '65.5%' },
  fathersName: { left: '4.5%', top: '79.5%' },
  // The template prints the date-of-birth label at the very bottom edge, so its
  // value sits to the right of the label rather than under it.
  dateOfBirth: { left: '30%', top: '91.5%' },
};

/**
 * KycPanCard — the fetched PAN drawn onto a PAN-card template, with only the
 * applicant's values overlaid on the printed labels.
 *
 * The data is the applicant's own demo record and the card is marked as a
 * preview: it is a UI mock, never a reproduction of an issued document.
 *
 * @param {object} details — { pan, name, fathersName, dateOfBirth }
 */
export default function KycPanCard({ details, className }) {
  if (!details?.pan) return null;

  const values = [
    { key: 'pan', value: details.pan },
    { key: 'name', value: details.name },
    { key: 'fathersName', value: details.fathersName },
    { key: 'dateOfBirth', value: details.dateOfBirth },
  ];

  return (
    <figure
      style={{ containerType: 'inline-size' }}
      className={cn(
        'relative aspect-[1572/1001] w-full overflow-hidden rounded-xl shadow-sm',
        className
      )}
    >
      <Image
        src={TEMPLATE_SRC}
        alt=""
        aria-hidden="true"
        fill
        sizes="(max-width: 640px) 100vw, 30rem"
        priority
        className="object-cover"
      />

      {values
        .filter((item) => item.value)
        .map((item) => (
          <span
            key={item.key}
            style={{
              left: SLOTS[item.key].left,
              top: SLOTS[item.key].top,
              fontSize: 'clamp(9px, 3cqw, 17px)',
            }}
            className={cn(
              'absolute max-w-[62%] truncate font-bold leading-none text-[#101a3d]',
              SLOTS[item.key].className
            )}
          >
            {item.value}
          </span>
        ))}

      <figcaption className="absolute bottom-[4%] left-[52%] rounded-full bg-[#1b2a5b]/15 px-2 py-[2px] text-[9px] font-bold tracking-wide text-[#1b2a5b]">
        DEMO PREVIEW
      </figcaption>
    </figure>
  );
}
