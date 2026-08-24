'use client';

import { forwardRef, useState } from 'react';
import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai';
import { cn } from '@/lib/utils';

const INPUT_CLASS =
  'w-full rounded-lg border border-homepage-borderColor bg-container-black px-4 py-3 pr-10 font-inter text-sm text-white placeholder-homepage-lightWhite outline-none transition-colors focus:border-brand-300 focus:ring-1 focus:ring-brand-300';

const PasswordInput = forwardRef(function PasswordInput({ id, placeholder, className, ...props }, ref) {
  const [show, setShow] = useState(false);

  return (
    <div className="relative">
      <input
        ref={ref}
        id={id}
        type={show ? 'text' : 'password'}
        placeholder={placeholder}
        className={cn(INPUT_CLASS, className)}
        {...props}
      />
      <button
        type="button"
        onClick={() => setShow((prev) => !prev)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300"
      >
        {show ? <AiOutlineEyeInvisible size={20} /> : <AiOutlineEye size={20} />}
      </button>
    </div>
  );
});

PasswordInput.displayName = 'PasswordInput';
export default PasswordInput;
