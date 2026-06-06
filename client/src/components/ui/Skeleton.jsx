import { cn } from '../../lib/utils';

export default function Skeleton({ className }) {
  return <div className={cn('relative overflow-hidden rounded-lg bg-slate-200 dark:bg-slate-800', className)}><div className="absolute inset-y-0 -left-full w-full animate-shimmer bg-gradient-to-r from-transparent via-white/45 to-transparent dark:via-white/10" /></div>;
}
