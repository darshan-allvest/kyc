'use client';

import { cn } from '@/lib/utils';
import CommonModal from '@/components/common/CommonModal';
import Button from '@/components/common/button/Button';
import Text from '@/components/common/Text';
import Heading from '@/components/common/Heading';
import { KYC_TYPO } from '@/constants/kycConstants';

// Accent per modal intent. Only the icon carries the tone — titles and body
// copy stay identical everywhere, so every modal in the flow reads the same.
const TONES = {
  brand: { ring: 'bg-brand-500/15', icon: 'text-brand-500' },
  warning: { ring: 'bg-homepage-darkOrange', icon: 'text-homepage-orange' },
  loss: { ring: 'bg-brandRed-loss/15', icon: 'text-brandRed-loss' },
};

/**
 * KycModal — the one modal shell every KYC modal uses: a centred tone icon,
 * title, description and optional note, with the button pair underneath.
 * Anything richer (detail cards, bullet lists, inputs) goes in `children` and
 * stays left-aligned below the centred header.
 *
 * @param {boolean}   open
 * @param {Function}  onClose
 * @param {Function}  [icon]        — lucide icon component
 * @param {string}    [tone]        — brand | warning | loss
 * @param {string}    [title]
 * @param {React.ReactNode} [description] — centred lead copy
 * @param {React.ReactNode} [note]        — centred footnote, muted
 * @param {React.ReactNode} [footer]      — the button pair
 * There is no header X: modals are dismissed through the footer, or by Esc /
 * clicking outside unless `preventClose` is set.
 *
 * @param {boolean}   [preventClose] — no silent dismiss; a choice is required
 */
export default function KycModal({
  open,
  onClose,
  icon: Icon,
  tone = 'brand',
  title,
  description,
  note,
  footer,
  children,
  preventClose = false,
  className,
}) {
  const accent = TONES[tone] ?? TONES.brand;
  const hasHeader = Icon || title || description || note;

  return (
    <CommonModal
      open={open}
      onClose={onClose}
      noHeader
      preventClose={preventClose}
      maxWidth="max-w-md"
      // focus:outline-none — Radix focuses the content element on open, which
      // otherwise paints the browser's default ring around the whole modal.
      contentClassName="focus:outline-none"
      // Deep-black surface with the bluish corner glows — the flow's one modal
      // background, overriding CommonModal's flatter default.
      cardClassName="bg-card-shade-deep"
      bodyClassName={className}
      footer={footer}
    >
      {hasHeader && (
        <div className="flex flex-col items-center text-center">
          {Icon && (
            <span
              className={cn(
                'flex size-12 items-center justify-center rounded-full',
                accent.ring
              )}
            >
              <Icon className={cn('size-6', accent.icon)} aria-hidden="true" />
            </span>
          )}

          {title && (
            <Heading
              as="h2"
              size="lg"
              font="sora"
              weight="bold"
              className={cn(Icon && 'mt-3')}
              color="text-white"
            >
              {title}
            </Heading>
          )}

          {description && (
            <Text
              className={cn(KYC_TYPO.subtitle, 'mt-2')}
              color="text-homepage-lightWhite"
            >
              {description}
            </Text>
          )}

          {note && (
            <Text className={cn(KYC_TYPO.body, 'mt-4')} color="text-homepage-darkGrey">
              {note}
            </Text>
          )}
        </div>
      )}

      {children != null && <div className={cn(hasHeader && 'mt-4')}>{children}</div>}
    </CommonModal>
  );
}

/**
 * KycModalActions — the button pair every KYC modal ends with: the dismissing
 * choice on the left, the committing one on the right. A modal with a single
 * action passes only the primary pair of props.
 *
 * @param {string}   primary       — label for the committing action
 * @param {Function} onPrimary
 * @param {object}   [primaryProps] — extra Button props, e.g. loading/disabled
 * @param {string}   [secondary]    — label for the dismissing action
 * @param {Function} [onSecondary]
 * @param {object}   [secondaryProps] — extra Button props, e.g. leftIcon
 * @param {boolean}  [stacked]      — keep the pair stacked, for long labels
 */
export function KycModalActions({
  primary,
  onPrimary,
  primaryProps,
  secondary,
  onSecondary,
  secondaryProps,
  stacked = false,
}) {
  const dismiss = secondary ? (
    <Button
      key="secondary"
      variant="outline"
      size="lg"
      fullWidth
      weight="semibold"
      className="whitespace-nowrap text-[14px]"
      onClick={onSecondary}
      {...secondaryProps}
    >
      {secondary}
    </Button>
  ) : null;

  const commit = (
    <Button
      key="primary"
      variant="authSubmit"
      size="lg"
      fullWidth
      weight="bold"
      className="whitespace-nowrap text-[14px]"
      onClick={onPrimary}
      {...primaryProps}
    >
      {primary}
    </Button>
  );

  return (
    <div className={cn('flex flex-col gap-2', !stacked && 'sm:flex-row')}>
      {/* Side by side the dismiss sits left; stacked, the commit leads. */}
      {stacked ? [commit, dismiss] : [dismiss, commit]}
    </div>
  );
}
