import { X } from 'lucide-react';
import Button from './Button';
import { cn } from '../../lib/utils';

export default function Modal({ open, title, children, onClose, className }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/55 p-4 backdrop-blur-sm" role="dialog" aria-modal="true">
      <div className={cn('surface max-h-[90vh] w-full max-w-xl overflow-auto rounded-panel animate-lift', className)}>
        <div className="flex items-center justify-between border-b border-slate-200/70 p-4 dark:border-slate-800">
          <h2 className="text-lg font-bold">{title}</h2>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close">
            <X className="h-5 w-5" />
          </Button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
}
