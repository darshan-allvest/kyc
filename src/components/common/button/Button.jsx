'use client';
import { forwardRef, isValidElement, cloneElement } from 'react';
import Link from 'next/link';
import { IoIosArrowForward } from 'react-icons/io';
import { cn } from '@/lib/utils';

const variants = {
  primary:
    'bg-brand-500 text-black border-brand-500 hover:bg-[#B3FF00] hover:border-[#B3FF00]',
  authSubmit:
    'bg-brand-500 text-black border-brand-500 hover:bg-brand-600 hover:border-brand-600',
  secondary:
    'bg-gray-200 text-gray-800 border-gray-200 hover:bg-gray-300 hover:border-gray-300 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-700 dark:hover:bg-gray-600',
  danger:
    'bg-red-600 text-white border-red-600 hover:bg-red-700 hover:border-red-700',
  destructive:
    'bg-red-600 text-white border-red-600 hover:bg-red-700 hover:border-red-700',
  success:
    'bg-green-600 text-white border-green-600 hover:bg-green-700 hover:border-green-700',
  warning:
    'bg-yellow-500 text-black border-yellow-500 hover:bg-yellow-400 hover:border-yellow-400',
  info: 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700 hover:border-blue-700',
  muted:
    'bg-gray-100 text-gray-500 border-gray-100 hover:bg-gray-200 hover:border-gray-200 dark:bg-gray-600 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-500 dark:hover:border-gray-500',
  outline:
    'bg-transparent text-brand-500 border-brand-500 hover:border-brand-500 hover:bg-brand-500 hover:text-black',
  ghost:
    'bg-transparent text-brand-500 border-transparent hover:bg-brand-500/10',
  link: 'bg-transparent text-brand-500 border-transparent underline-offset-4 hover:underline !p-0',
  default:
    'bg-white text-gray-800 border-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600',
  none: '', // no variant styling — fully className-driven (pairs with size="none")
};

const sizes = {
  xs: 'px-2 py-1 text-xs',
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
  xl: 'px-8 py-4 text-lg',
  authPrimary: 'py-3 text-base',
  none: '', // no fixed padding/text-size — let className drive it
};

const radiuses = {
  none: 'rounded-none',
  sm: 'rounded-sm',
  md: 'rounded-md',
  lg: 'rounded-lg',
  xl: 'rounded-xl',
  full: 'rounded-full',
};

const fonts = {
  inter: 'font-inter',
  sora: 'font-sora',
  poppins: 'font-poppins',
  mono: 'font-mono',
};

const weights = {
  thin: 'font-thin',
  light: 'font-light',
  normal: 'font-normal',
  regular: 'font-normal',
  medium: 'font-medium',
  semibold: 'font-semibold',
  bold: 'font-bold',
  extrabold: 'font-extrabold',
};

/**
 * Generic Button — renders as <button type="button"> or <Link> (when href is set).
 *
 * Variant:   primary | secondary | danger | destructive | success | warning | info | muted | outline | ghost | link | default | none
 * Size:      xs | sm | md | lg | xl | none
 * Rounded:   none | sm | md | lg | xl | full
 *
 * Use variant="none" size="none" for a fully className-driven button (e.g. a
 * bespoke pill or a TooltipTrigger asChild target that needs ref forwarding).
 *
 * Icon slots:
 *   leftIcon / rightIcon — pass an icon component, OR an already-rendered element
 *                          (the latter keeps the caller's own size/style/color, e.g.
 *                          a dynamically-colored chevron or a color dot).
 *   showIcon             — shorthand to append the default IoIosArrowForward on the right (ViewMoreButton compat).
 *   icon                 — override the default arrow icon used by showIcon.
 *
 * Text:
 *   children  — primary label; falls back to `text`, then to the i18n "common.viewAll" key.
 *   text      — alternative to children (ViewMoreButton compat).
 *   font      — inter | sora | poppins | mono
 *   weight    — thin | light | normal | regular | medium | semibold | bold | extrabold
 *
 * Active-tab mode (ViewMoreButton compat):
 *   showActiveTransition — enables the active-tab pill style.
 *   isActive             — marks this tab as selected (applies active-gradient-tab class).
 *
 * Other:
 *   href          — renders as Next.js <Link>
 *   disabled      — disabled state
 *   loading       — spinner replaces leftIcon, disables interaction
 *   fullWidth     — w-full
 *   iconClassName — extra classes on both icon slots
 *   className     — merged last
 *   onClick
 *   type          — HTML button type (default: "button")
 *   ...rest       — forwarded to the underlying <button>/<Link> (e.g. data-*, aria-*,
 *                   onMouseEnter — lets Radix TooltipTrigger/Slot asChild props reach the element).
 */
const Button = forwardRef(function Button(
  {
    // Appearance
    variant = 'primary',
    size = 'md',
    rounded = 'full',
    font,
    weight,

    // Navigation
    href,

    // Icons
    leftIcon: LeftIcon,
    rightIcon: RightIcon,
    showIcon = false,
    icon: DefaultIcon,
    iconClassName = '',

    // Label
    children,
    text,

    // State
    disabled = false,
    loading = false,
    fullWidth = false,

    // Active-tab mode
    showActiveTransition = false,
    isActive = false,

    // HTML
    type = 'button',
    className = '',
    onClick,
    ...rest
  },
  ref
) {
  const isDisabled = disabled || loading;

  const ArrowIcon = DefaultIcon || IoIosArrowForward;
  const label = children ?? text ?? 'View all';

  // Icon slots accept either a component (rendered with our icon classes) or an
  // already-rendered element — the latter lets callers keep full control of the
  // icon's size/style/color (e.g. a per-item colored chevron or a color dot).
  const renderIcon = (Icon) =>
    !Icon ? null : isValidElement(Icon) ? (
      cloneElement(Icon, {
        className: cn('shrink-0', iconClassName, Icon.props?.className),
      })
    ) : (
      <Icon className={cn('shrink-0', iconClassName)} />
    );

  // ── Active-tab pill mode ────────────────────────────────────────────────────
  if (showActiveTransition) {
    const pillClasses = cn(
      'relative inline-flex items-center transition',
      radiuses[rounded] ?? radiuses.full,
      isDisabled && 'cursor-not-allowed opacity-50',
      isActive
        ? 'active-gradient-tab'
        : cn(
            'border border-brand-500 text-brand-500 py-2',
            sizes[size] ?? sizes.sm
          ),
      className
    );

    const innerClasses = cn(
      'inline-flex items-center gap-1',
      radiuses[rounded] ?? radiuses.full,
      sizes[size] ?? sizes.sm,
      fonts[font] ?? '',
      weights[weight] ?? '',
      isActive ? 'text-white' : 'text-brand-500 hover:text-brand-500'
    );

    const Wrapper = href ? Link : 'button';
    const wrapperProps = href
      ? { ...rest, href, onClick, className: pillClasses, 'aria-disabled': isDisabled }
      : { ...rest, type, onClick, disabled: isDisabled, className: pillClasses };

    return (
      <Wrapper {...wrapperProps}>
        <span className={innerClasses}>
          <span>{label}</span>
          {showIcon && <ArrowIcon className={iconClassName} />}
          {renderIcon(RightIcon)}
        </span>
      </Wrapper>
    );
  }

  // ── Standard mode ───────────────────────────────────────────────────────────
  // When a caller overrides the background via className (e.g. `bg-brandRed-500`),
  // the variant's border colour (primary's is green `border-brand-500`) would
  // otherwise leak as a mismatched ring around the new colour. Default such
  // buttons to a transparent border — with background-clip: border-box the bg
  // shows through it seamlessly. An explicit `border-*` in className still wins
  // (it's merged last).
  // For variant="none" (no variant border colour at all), ANY background in
  // className should get the transparent border — otherwise the base `border`
  // renders in the theme's default (grey/white) colour and shows as a stray ring
  // around solid buttons like a `bg-brand-500` submit/CTA.
  const overridesBg =
    variant === 'none'
      ? /(?:^|\s)bg-(?!transparent)/.test(className)
      : /(?:^|\s)bg-(?!brand-500|transparent)/.test(className);
  const baseBgClass = (className.match(/(?:^|\s)(bg-\S+)/) || [])[1];
  const hasHoverBg = /(?:^|\s)hover:bg-/.test(className);
  const hasHoverBorder = /(?:^|\s)hover:border-/.test(className);
  const classes = cn(
    'inline-flex items-center justify-center gap-2 border font-medium transition-colors',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2',
    variants[variant] ?? variants.primary,
    sizes[size] ?? sizes.md,
    radiuses[rounded] ?? radiuses.full,
    fonts[font] ?? '',
    weights[weight] ?? '',
    fullWidth && 'w-full',
    isDisabled && 'cursor-not-allowed opacity-50 pointer-events-none',
    overridesBg && 'border-transparent',
    overridesBg && !hasHoverBg && baseBgClass && `hover:${baseBgClass}`,
    overridesBg && !hasHoverBorder && 'hover:border-transparent',
    className
  );

  const content = (
    <>
      {loading ? <Spinner className={iconClassName} /> : renderIcon(LeftIcon)}
      <span>{label}</span>
      {!loading && renderIcon(RightIcon)}
      {!loading && showIcon && (
        <ArrowIcon className={cn('shrink-0', iconClassName)} />
      )}
    </>
  );

  if (href) {
    return (
      <Link
        ref={ref}
        {...rest}
        href={href}
        onClick={onClick}
        className={classes}
        aria-disabled={isDisabled}
      >
        {content}
      </Link>
    );
  }

  return (
    <button
      ref={ref}
      {...rest}
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      className={classes}
    >
      {content}
    </button>
  );
});

export default Button;

function Spinner({ className }) {
  return (
    <svg
      className={cn('size-4 animate-spin', className)}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 22 6.477 22 12h-4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}
