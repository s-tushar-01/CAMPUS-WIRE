import { imageUrl, initials, cn } from '../../lib/utils';

export default function Avatar({ user, src, name, size = 'md', className }) {
  const sizes = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-14 w-14 text-base',
    xl: 'h-24 w-24 text-2xl',
  };
  const label = name || user?.name || 'CampusWire';
  const url = src || imageUrl(user?.profilePic);

  return (
    <div className={cn('inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-indigo-100 font-bold text-primary ring-2 ring-white dark:bg-indigo-950 dark:ring-slate-950', sizes[size], className)}>
      {url ? <img src={url} alt={label} loading="lazy" className="h-full w-full object-cover" /> : initials(label)}
    </div>
  );
}
