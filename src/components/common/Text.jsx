import { cn } from '@/lib/utils';

const sizes = {
  '2xs': 'text-[8px]',
  xxs: 'text-[10px]',
  xs: 'text-xs',
  sm: 'text-sm',
  base: 'text-base',
  lg: 'text-lg',
  xl: 'text-xl',
  '2xl': 'text-2xl',
  // No font-size class — inherits from the parent, like a plain <div>/<span>.
  // Use when converting a size-less raw element so the rendered size is unchanged.
  inherit: '',
};

const fonts = {
  inter: 'font-inter',
  sora: 'font-sora',
  poppins: 'font-poppins',
  mono: 'font-mono',
};

const weights = {
  thin: 'font-thin',
  extralight: 'font-extralight',
  light: 'font-light',
  normal: 'font-normal',
  regular: 'font-normal',
  medium: 'font-medium',
  semibold: 'font-semibold',
  bold: 'font-bold',
  extrabold: 'font-extrabold',
  black: 'font-black',
};

const aligns = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
  justify: 'text-justify',
};

const leadings = {
  none: 'leading-none',
  tight: 'leading-tight',
  snug: 'leading-snug',
  normal: 'leading-normal',
  relaxed: 'leading-relaxed',
  loose: 'leading-loose',
  150: 'leading-[150%]',
};

const casings = {
  none: '',
  uppercase: 'uppercase',
  lowercase: 'lowercase',
  capitalize: 'capitalize',
};

const truncates = {
  none: '',
  1: 'truncate', // overflow-hidden + text-ellipsis + whitespace-nowrap
  2: 'line-clamp-2',
  3: 'line-clamp-3',
  4: 'line-clamp-4',
};

const overflows = {
  visible: 'overflow-visible',
  hidden: 'overflow-hidden',
  scroll: 'overflow-scroll',
  auto: 'overflow-auto',
  ellipsis: 'truncate', // overflow-hidden + text-ellipsis + whitespace-nowrap
};

// Numeric tabular figures spec used by financial card text (price/change/symbol).
const NUMERIC_FIGURES = 'leading-[150%] lining-nums tabular-nums';

// Pre-built role variants (semantic shortcuts); each can be overridden by explicit props.
// Optional `extras` adds raw Tailwind classes the variant always wants (leading, nums, etc.).
const variants = {
  body: { size: 'sm', weight: 'normal', color: '' },
  caption: { size: 'xs', weight: 'normal', color: 'text-gray-500' },
  muted: { size: 'sm', weight: 'normal', color: 'text-gray-500' },
  label: { size: 'xs', weight: 'medium', color: '' },
  price: { size: 'sm', weight: 'semibold', color: '' },
  profit: { size: 'sm', weight: 'medium', color: 'text-brand-profit' },
  loss: { size: 'sm', weight: 'medium', color: 'text-brandRed-loss' },
  // Card typography spec — Inter, 14/600 heading & 12/400 body, 150% leading, tabular figures.
  cardHeading: {
    size: 'sm',
    weight: 'semibold',
    color: '',
    extras: NUMERIC_FIGURES,
  },
  cardBody: {
    size: 'xs',
    weight: 'normal',
    color: '',
    extras: NUMERIC_FIGURES,
  },
  // Section description — Inter, 14/400, 150% leading, tabular figures.
  cardDescription: {
    size: 'sm',
    weight: 'normal',
    color: '',
    extras: NUMERIC_FIGURES,
  },
};

/**
 * Generic Text — body text component.
 *
 * Props:
 *   children  — text content (or use `text`)
 *   text      — alternative to children
 *   as        — HTML tag (default 'p')
 *   variant   — body | caption | muted | label | price | profit | loss (defaults for size+weight+color)
 *   size      — 2xs | xxs | xs | sm | base | lg | xl | 2xl
 *   font      — inter | sora | poppins | mono
 *   weight    — thin..black (see Heading)
 *   color     — Tailwind text color class (e.g. "text-white")
 *   align     — left | center | right | justify
 *   leading   — none | tight | snug | normal | relaxed | loose
 *   casing    — none | uppercase | lowercase | capitalize
 *   truncate  — none | 1 | 2 | 3 | 4 (line-clamp)
 *   overflow  — visible | hidden | scroll | auto | ellipsis (abc...)
 *   className — merged last
 */
export default function Text({
  children,
  text,
  as: Tag = 'p',
  variant = 'body',
  size,
  font = 'inter',
  weight,
  color,
  align = 'left',
  leading = 'normal',
  casing = 'none',
  truncate = 'none',
  overflow,
  className = '',
  ...rest
}) {
  const v = variants[variant] ?? variants.body;
  const finalSize = size ?? v.size;
  const finalWeight = weight ?? v.weight;
  const finalColor = color ?? v.color;

  const classes = cn(
    sizes[finalSize] ?? sizes.sm,
    fonts[font] ?? fonts.inter,
    weights[finalWeight] ?? weights.normal,
    aligns[align] ?? aligns.left,
    leadings[leading] ?? leadings.normal,
    casings[casing] ?? '',
    truncates[truncate] ?? '',
    overflow ? (overflows[overflow] ?? '') : '',
    finalColor,
    v.extras,
    className
  );

  return (
    <Tag className={classes} {...rest}>
      {children ?? text}
    </Tag>
  );
}
