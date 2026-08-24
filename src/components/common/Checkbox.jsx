'use client';

import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import Text from '@/components/common/Text';

const sizes = {
  sm: { box: 'size-4 rounded', icon: 11 },
  md: { box: 'size-6 rounded-md', icon: 14 },
};

/**
 * Checkbox — controlled checkbox with a brand-500 filled checked state.
 *
 * Two modes:
 *   - Interactive: pass `onChange` — renders an accessible <label> wrapping a
 *     visually-hidden <input type="checkbox"> plus the styled box (and `label`).
 *   - Presentational: omit `onChange` — renders only the styled box, for when a
 *     parent row/button owns the toggle (e.g. a selectable list row).
 *
 * @param {boolean}  checked      — checked state
 * @param {Function} [onChange]   — (checked, event) => void; omit for display-only
 * @param {string}   [id]         — input id
 * @param {React.ReactNode} [label] — optional label rendered beside the box
 * @param {'sm'|'md'} [size]      — 'sm' (16px, default) | 'md' (24px)
 * @param {boolean}  [disabled]   — disabled state
 * @param {string}   [className]  — wrapper classes
 * @param {string}   [boxClassName] — extra classes on the box
 * @param {object}   [labelProps] — props forwarded to the <Text> label
 * @param {object}   [rest]       — forwarded to the underlying <input>
 */
export default function Checkbox({
  checked = false,
  onChange,
  id,
  label,
  size = 'sm',
  disabled = false,
  className = '',
  boxClassName = '',
  labelProps = {},
  ...rest
}) {
  const s = sizes[size] ?? sizes.sm;

  const box = (
    <span
      className={cn(
        'flex shrink-0 items-center justify-center border transition-colors',
        s.box,
        checked
          ? 'border-brand-500 bg-brand-500 text-black'
          : 'border-white/30 bg-transparent',
        disabled && 'opacity-50',
        boxClassName
      )}
    >
      {checked && <Check size={s.icon} strokeWidth={3} />}
    </span>
  );

  const labelNode = label && (
    <Text
      as="span"
      size="xs"
      weight="medium"
      color="text-homepage-dropdownLabel"
      {...labelProps}
    >
      {label}
    </Text>
  );

  // Presentational — a parent element owns the toggle.
  if (!onChange) {
    if (!label) return box;
    return (
      <span className={cn('inline-flex items-center gap-2', className)}>
        {box}
        {labelNode}
      </span>
    );
  }

  // Interactive — accessible label-wrapped input.
  return (
    <label
      className={cn(
        'inline-flex items-center gap-2',
        disabled ? 'cursor-not-allowed' : 'cursor-pointer',
        className
      )}
    >
      <input
        type="checkbox"
        id={id}
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange?.(e.target.checked, e)}
        className="sr-only"
        {...rest}
      />
      {box}
      {labelNode}
    </label>
  );
}
