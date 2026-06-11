import { AlertCircle, CheckCircle2, Info, XCircle } from 'lucide-react';
import { cn } from '../../lib/utils';

const styles = {
  info: 'border-indigo-200 bg-indigo-50 text-indigo-800 dark:border-indigo-900/70 dark:bg-indigo-950/40 dark:text-indigo-200',
  success: 'border-green-200 bg-green-50 text-green-800 dark:border-green-900/70 dark:bg-green-950/40 dark:text-green-200',
  warning: 'border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900/70 dark:bg-amber-950/40 dark:text-amber-200',
  error: 'border-red-200 bg-red-50 text-red-800 dark:border-red-900/70 dark:bg-red-950/40 dark:text-red-200',
};

const icons = {
  info: Info,
  success: CheckCircle2,
  warning: AlertCircle,
  error: XCircle,
};

export default function StatusBanner({ tone = 'info', title, children, className }) {
  const Icon = icons[tone] || Info;
  return (
    <div className={cn('flex gap-3 rounded-card border p-3 text-sm', styles[tone], className)}>
      <Icon className="mt-0.5 h-4 w-4 shrink-0" />
      <div className="min-w-0">
        {title && <p className="font-bold">{title}</p>}
        {children && <div className={title ? 'mt-1 opacity-90' : ''}>{children}</div>}
      </div>
    </div>
  );
}
