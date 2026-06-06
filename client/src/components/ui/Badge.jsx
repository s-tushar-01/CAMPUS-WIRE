import { cn } from '../../lib/utils';

const variants = {
  default: 'bg-indigo-50 text-primary dark:bg-indigo-950 dark:text-indigo-200',
  success: 'bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300',
  warning: 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
  error: 'bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300',
  muted: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
};

export default function Badge({ variant = 'default', className, ...props }) {
  return <span className={cn('inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold', variants[variant], className)} {...props} />;
}
