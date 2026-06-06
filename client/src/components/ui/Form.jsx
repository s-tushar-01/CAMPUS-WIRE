import { cn } from '../../lib/utils';

export function Input({ className, ...props }) {
  return (
    <input
      className={cn(
        'focus-ring h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-950 placeholder:text-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50',
        className
      )}
      {...props}
    />
  );
}

export function Textarea({ className, ...props }) {
  return (
    <textarea
      className={cn(
        'focus-ring min-h-[104px] w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm text-slate-950 placeholder:text-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50',
        className
      )}
      {...props}
    />
  );
}

export function Select({ className, ...props }) {
  return (
    <select
      className={cn(
        'focus-ring h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-950 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50',
        className
      )}
      {...props}
    />
  );
}

export function FieldError({ children }) {
  if (!children) return null;
  return <p className="mt-1 text-xs font-medium text-error">{children}</p>;
}
