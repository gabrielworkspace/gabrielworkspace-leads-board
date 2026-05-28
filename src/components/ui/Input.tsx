import React from 'react';
import { clsx } from 'clsx';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, icon, ...props }, ref) => {
    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            className={clsx(
              "w-full bg-[#0A0A0A] border rounded-xl h-11 text-white text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-[#00A3FF]/50",
              icon ? "pl-10 pr-4" : "px-4",
              error ? "border-red-500/50" : "border-white/10 hover:border-white/20",
              className
            )}
            {...props}
          />
        </div>
        {error && <span className="text-xs text-red-500 mt-0.5">{error}</span>}
      </div>
    );
  }
);

Input.displayName = "Input";
