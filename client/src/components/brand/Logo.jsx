import { Link } from 'react-router-dom';
import { cn } from '../../lib/utils';

export default function Logo({ className, iconClassName = 'h-10 w-10', textClassName = 'text-lg', hideTextOnMobile = false }) {
  return (
    <Link to="/" className={cn('flex items-center gap-2 font-extrabold tracking-tight text-slate-950 dark:text-white', className)}>
      <img src="/assets/brand/campuswire-mark.svg" alt="CampusWire" className={cn('shrink-0 rounded-xl shadow-card', iconClassName)} />
      <span className={cn(hideTextOnMobile && 'hidden sm:inline', textClassName)}>CampusWire</span>
    </Link>
  );
}
