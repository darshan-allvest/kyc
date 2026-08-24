'use client';

import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

const INPUT_CLASS =
  'autofill-dark w-full rounded-lg border border-homepage-borderColor bg-container-black px-4 py-3 font-inter text-sm text-white placeholder-homepage-lightWhite outline-none transition-colors focus:border-brand-300 focus:ring-1 focus:ring-brand-300';

const TextInput = forwardRef(function TextInput({ className, ...props }, ref) {
  return (
    <input
      ref={ref}
      className={cn(INPUT_CLASS, className)}
      {...props}
    />
  );
});

TextInput.displayName = 'TextInput';
export default TextInput;
