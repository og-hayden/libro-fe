'use client';

import { InputHTMLAttributes, forwardRef, useState } from 'react';
import { cn } from '@/lib/utils';

export interface FloatingInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

const FloatingInput = forwardRef<HTMLInputElement, FloatingInputProps>(
  ({ className, type, label, error, value, ...props }, ref) => {
    const [isFocused, setIsFocused] = useState(false);
    const hasValue = value !== undefined && value !== '';
    const isFloating = isFocused || hasValue;

    return (
      <div className="relative">
        <input
          type={type}
          className={cn(
            'peer w-full h-14 px-4 pt-6 pb-2 text-base bg-transparent border-2 rounded-2xl transition-all duration-200 focus:outline-none',
            error 
              ? 'border-red-400 focus:border-red-500' 
              : 'border-stone-300 focus:border-blue-500',
            className
          )}
          placeholder=""
          value={value}
          onFocus={(e) => {
            setIsFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            props.onBlur?.(e);
          }}
          ref={ref}
          {...props}
        />
        <label
          className={cn(
            'absolute left-4 transition-all duration-200 pointer-events-none',
            isFloating
              ? 'top-2 text-sm text-blue-500 font-normal'
              : 'top-1/2 -translate-y-1/2 text-base text-stone-500',
            error && isFloating && 'text-red-500'
          )}
        >
          {label}
        </label>
        {error && (
          <p className="mt-2 text-sm text-red-500">{error}</p>
        )}
      </div>
    );
  }
);

FloatingInput.displayName = 'FloatingInput';

export { FloatingInput };
