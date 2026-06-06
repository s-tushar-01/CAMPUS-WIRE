import { cn } from '../../lib/utils';

export function Card({ className, ...props }) {
  return <section className={cn('surface rounded-card', className)} {...props} />;
}

export function CardHeader({ className, ...props }) {
  return <div className={cn('border-b border-slate-200/70 p-4 dark:border-slate-800', className)} {...props} />;
}

export function CardContent({ className, ...props }) {
  return <div className={cn('p-4', className)} {...props} />;
}
