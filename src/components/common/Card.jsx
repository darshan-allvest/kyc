'use client';
import Link from 'next/link';
import { cn } from '@/lib/utils';

const radiuses = {
  none: 'rounded-none',
  sm: 'rounded-sm',
  md: 'rounded-md',
  lg: 'rounded-lg',
  xl: 'rounded-xl',
  '2xl': 'rounded-2xl',
  '3xl': 'rounded-3xl',
  full: 'rounded-full',
};

const paddings = {
  none: 'p-0',
  xs: 'p-2',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
  xl: 'p-8',
  responsive: 'p-4 sm:p-6 md:p-6 lg:p-6',
};

const bgs = {
  gradient: 'gradient-card',
  card: 'bg-homepage-cardBg',
  modal: 'bg-homepage-buyModal',
  white: 'bg-white',
  dark: 'bg-[#1a1a1a]',
  none: '',
};

const borders = {
  none: '',
  default: 'border border-homepage-borderColor',
  shade: 'border border-homepage-borderShade',
  brand: 'border border-brand-500',
};

const shadows = {
  none: '',
  sm: 'shadow-sm',
  md: 'shadow-md',
  lg: 'shadow-lg',
  xl: 'shadow-xl',
};

const widths = {
  auto: '',
  full: 'w-full',
  fit: 'w-fit',
};

/**
 * Card — generic container with bg / border / radius / padding controls.
 *
 * Props:
 *   bg          — gradient | card | modal | white | dark | none (default 'gradient')
 *   rounded     — none | sm | md | lg | xl | 2xl | 3xl | full (default 'lg')
 *   padding     — none | xs | sm | md | lg | xl | responsive (default 'md')
 *   border      — none | default | shade | brand (default 'none')
 *   shadow      — none | sm | md | lg | xl (default 'none')
 *   width       — auto | full | fit (default 'auto')
 *   height      — Tailwind class (e.g. 'h-32'); pass directly via className if more complex
 *   hover       — Tailwind hover class(es)
 *   as          — element/tag override (default 'div')
 *   href        — when set, renders as next/link
 *   onClick     — click handler
 *   className   — merged last; overrides above
 */
export default function Card({
  bg = 'gradient',
  rounded = 'lg',
  padding = 'md',
  border = 'none',
  shadow = 'none',
  width = 'auto',
  height = '',
  hover = '',
  as: Tag = 'div',
  href,
  onClick,
  className = '',
  children,
  ...rest
}) {
  const classes = cn(
    bgs[bg] ?? bgs.gradient,
    radiuses[rounded] ?? radiuses.lg,
    paddings[padding] ?? paddings.md,
    borders[border] ?? '',
    shadows[shadow] ?? '',
    widths[width] ?? '',
    height,
    hover,
    onClick || href ? 'cursor-pointer' : '',
    className
  );

  if (href) {
    return (
      <Link href={href} onClick={onClick} className={classes} {...rest}>
        {children}
      </Link>
    );
  }

  return (
    <Tag onClick={onClick} className={classes} {...rest}>
      {children}
    </Tag>
  );
}
