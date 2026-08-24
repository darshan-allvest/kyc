import { cn } from '@/lib/utils';

/**
 * Divider — a thin separator line for segregating sections (or list rows).
 *
 * Defaults to a full-width 1px horizontal line in the app's faint divider color.
 * Override color/thickness/spacing via `className` (e.g. "my-4", "bg-white/20").
 *
 * Props:
 *   orientation — 'horizontal' (default) | 'vertical'
 *   className   — merged last (color, thickness, spacing overrides)
 *   ...rest     — spread onto the root element
 */
export default function Divider({
  orientation = 'horizontal',
  className = '',
  ...rest
}) {
  const isVertical = orientation === 'vertical';
  return (
    <div
      role="separator"
      aria-orientation={orientation}
      className={cn(
        'shrink-0 bg-white/10',
        isVertical ? 'h-full w-px' : 'h-px w-full',
        className
      )}
      {...rest}
    />
  );
}
