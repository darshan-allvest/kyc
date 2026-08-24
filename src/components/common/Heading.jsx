import { cn } from '@/lib/utils';
import { toSentenceCase } from '@/utils/textHelpers';

const sizes = {
  '2xs': 'text-[8px]',
  xxs: 'text-[10px]',
  xs: 'text-xs',
  sm: 'text-sm',
  base: 'md:text-base',
  lg: 'md:text-lg',
  xl: 'md:text-xl',
  '2xl': 'md:text-2xl',
  '3xl': 'md:text-3xl',
  '4xl': 'md:text-4xl',
  '5xl': 'md:text-5xl',
  default: 'md:text-xl lg:text-[22px]',
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
  default: 'leading-[160%]',
  150: 'leading-[150%]',
};

const casings = {
  none: '',
  uppercase: 'uppercase',
  lowercase: 'lowercase',
  capitalize: 'capitalize',
  // 'sentence' has no CSS equivalent — text is transformed in JS below.
  sentence: '',
};

const truncates = {
  none: '',
  1: 'truncate',
  2: 'line-clamp-2',
  3: 'line-clamp-3',
  4: 'line-clamp-4',
};

/**
 * Generic Heading — fully dynamic page/section title.
 *
 * Props:
 *   title     — text content (alternative to children)
 *   children  — text content
 *   as        — HTML tag: h1 | h2 | h3 | h4 | h5 | h6 | span | div (default h1)
 *   size      — 2xs | xxs | xs | sm | base | lg | xl | 2xl | 3xl | 4xl | 5xl | default
 *   font      — inter | sora | poppins | mono
 *   weight    — thin | extralight | light | normal | regular | medium | semibold | bold | extrabold | black
 *   color     — Tailwind text color class (e.g. "text-white", "text-brand-500"); default unset
 *   align     — left | center | right | justify
 *   leading   — none | tight | snug | normal | relaxed | loose | default (160%)
 *   casing    — none | uppercase | lowercase | capitalize | sentence (default none)
 *               'sentence' → first letter capital, rest lowercase, "Allvest" kept capital
 *   truncate  — none | 1 | 2 | 3 | 4 (line-clamp)
 *   className — merged last; can override any of the above
 */
export default function Heading({
  title,
  children,
  as: Tag = 'h1',
  size = 'default',
  font = 'inter',
  weight = 'bold',
  color = '',
  align = 'left',
  leading = 'default',
  casing = '',
  truncate = 'none',
  className = '',
  ...rest
}) {
  const classes = cn(
    'align-middle text-base',
    sizes[size] ?? sizes.default,
    fonts[font] ?? fonts.inter,
    weights[weight] ?? weights.bold,
    aligns[align] ?? aligns.left,
    leadings[leading] ?? leadings.default,
    casings[casing] ?? '',
    truncates[truncate] ?? '',
    color,
    className
  );

  const content = children ?? title;
  const rendered =
    casing === 'sentence' && typeof content === 'string'
      ? toSentenceCase(content)
      : content;

  return (
    <Tag className={classes} {...rest}>
      {rendered}
    </Tag>
  );
}
