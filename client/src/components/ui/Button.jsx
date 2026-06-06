import { cn } from '../../lib/utils';

const variants = {
  primary: 'bg-primary text-white hover:bg-indigo-700',
  secondary: 'bg-slate-100 text-slate-900 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700',
  ghost: 'text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800',
  danger: 'bg-error text-white hover:bg-red-600',
  outline: 'border border-slate-200 bg-white text-slate-800 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100',
};

const sizes = {
  sm: 'h-8 px-3 text-sm',
  md: 'h-10 px-4 text-sm',
  lg: 'h-11 px-5 text-base',
  icon: 'h-10 w-10 p-0',
};

export default function Button({ className, variant = 'primary', size = 'md', type = 'button', ...props }) {
  return (
    <button
      type={type}
      className={cn(
        'focus-ring inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition active:scale-[0.98] disabled:pointer-events-none disabled:opacity-55',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    />
  );
}
