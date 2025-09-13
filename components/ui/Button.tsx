import React from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, disabled, children, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-0 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl';
    
    const variants = {
      primary: 'bg-foreground text-background hover:bg-foreground/90 focus:ring-foreground/20 shadow-sm',
      secondary: 'bg-background text-foreground border border-border hover:bg-accent focus:ring-foreground/10 shadow-sm',
      ghost: 'text-foreground hover:bg-accent focus:ring-foreground/10'
    };

    const sizes = {
      sm: 'h-9 px-4 text-sm font-medium',
      md: 'h-10 px-5 text-sm font-medium',
      lg: 'h-12 px-6 text-base font-medium'
    };

    return (
      <button
        className={cn(
          baseStyles,
          variants[variant],
          sizes[size],
          className
        )}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button };
