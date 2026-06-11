import { Inbox } from 'lucide-react';
import Button from './Button';

export default function EmptyState({ icon: Icon = Inbox, title, description, actionLabel, onAction }) {
  return (
    <div className="rounded-card border border-dashed border-slate-300 bg-slate-50 p-8 text-center dark:border-slate-700 dark:bg-slate-900/70">
      <div className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-white text-primary shadow-card dark:bg-slate-800">
        <Icon className="h-6 w-6" />
      </div>
      <h2 className="mt-4 font-bold">{title}</h2>
      {description && <p className="mx-auto mt-2 max-w-sm text-sm text-slate-500 dark:text-slate-400">{description}</p>}
      {actionLabel && onAction && <Button className="mt-4" onClick={onAction}>{actionLabel}</Button>}
    </div>
  );
}
