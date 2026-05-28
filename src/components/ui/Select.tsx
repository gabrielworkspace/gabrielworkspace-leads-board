import React from 'react';
import { clsx } from 'clsx';
import { ChevronDown } from 'lucide-react';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, icon, children, ...props }, ref) => {
    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 z-10 pointer-events-none">
              {icon}
            </div>
          )}
          <select
            ref={ref}
            className={clsx(
              "w-full bg-[#0A0A0A] border rounded-xl h-11 text-white text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-[#00A3FF]/50 appearance-none cursor-pointer",
              icon ? "pl-10 pr-10" : "px-4 pr-10",
              error ? "border-red-500/50" : "border-white/10 hover:border-white/20",
              className
            )}
            {...props}
          >
            {children}
          </select>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">
            <ChevronDown size={16} />
          </div>
        </div>
        {error && <span className="text-xs text-red-500 mt-0.5">{error}</span>}
      </div>
    );
  }
);

Select.displayName = "Select";
