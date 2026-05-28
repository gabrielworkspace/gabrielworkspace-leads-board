import React from 'react';
import { clsx } from 'clsx';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, children, disabled, ...props }, ref) => {
    const baseStyles = "inline-flex items-center justify-center rounded-xl font-semibold transition-all focus:outline-none disabled:opacity-50 disabled:pointer-events-none active:scale-95";
    
    const variants = {
      primary: "bg-[#00A3FF] text-white hover:bg-[#008AE6] shadow-[0_0_15px_rgba(0,163,255,0.2)] hover:shadow-[0_0_20px_rgba(0,163,255,0.4)]",
      outline: "border border-white/10 text-white hover:bg-white/5",
      danger: "bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/20",
      ghost: "text-gray-400 hover:text-white hover:bg-white/5",
    };

    const sizes = {
      sm: "h-8 px-3 text-xs",
      md: "h-10 px-4 py-2 text-sm",
      lg: "h-12 px-8 text-base",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={clsx(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
