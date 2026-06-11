import { MoreHorizontal } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import Button from './Button';

export default function ActionMenu({ label = 'Actions', items = [] }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const close = (event) => {
      if (!ref.current?.contains(event.target)) setOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  return (
    <div ref={ref} className="relative inline-flex">
      <Button variant="ghost" size="icon" onClick={() => setOpen((value) => !value)} aria-label={label}>
        <MoreHorizontal className="h-4 w-4" />
      </Button>
      {open && (
        <div className="absolute right-0 top-11 z-20 w-48 overflow-hidden rounded-card border border-slate-200 bg-white py-1 text-sm shadow-float dark:border-slate-700 dark:bg-slate-900">
          {items.map((item) => (
            <button
              key={item.label}
              className={`flex w-full items-center gap-2 px-3 py-2 text-left font-semibold hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-slate-800 ${item.danger ? 'text-error' : ''}`}
              disabled={item.disabled}
              onClick={() => {
                setOpen(false);
                item.onClick?.();
              }}
            >
              {item.icon && <item.icon className="h-4 w-4" />}
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
