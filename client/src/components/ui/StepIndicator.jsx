import { Check } from 'lucide-react';

export default function StepIndicator({ steps, current = 0 }) {
  return (
    <ol className="grid gap-2 sm:grid-cols-3">
      {steps.map((step, index) => {
        const complete = index < current;
        const active = index === current;
        return (
          <li key={step} className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-bold ${active ? 'border-primary bg-indigo-50 text-primary dark:bg-indigo-950/50' : complete ? 'border-green-200 bg-green-50 text-green-700 dark:border-green-900 dark:bg-green-950/40 dark:text-green-300' : 'border-slate-200 text-slate-500 dark:border-slate-800'}`}>
            <span className={`grid h-5 w-5 place-items-center rounded-full text-[11px] ${complete ? 'bg-success text-white' : active ? 'bg-primary text-white' : 'bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-300'}`}>
              {complete ? <Check className="h-3 w-3" /> : index + 1}
            </span>
            <span className="truncate">{step}</span>
          </li>
        );
      })}
    </ol>
  );
}
