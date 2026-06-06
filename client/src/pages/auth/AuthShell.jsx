import Logo from '../../components/brand/Logo';

export default function AuthShell({ title, subtitle, children, footer }) {
  return (
    <div className="grid min-h-screen place-items-center bg-slate-50 px-4 py-10 dark:bg-slate-950">
      <div className="w-full max-w-md">
        <Logo className="mx-auto mb-6 w-max" iconClassName="h-11 w-11" textClassName="text-xl" />
        <div className="surface rounded-panel p-6">
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-extrabold">{title}</h1>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>
          </div>
          {children}
          {footer && <div className="mt-5 text-center text-sm text-slate-500 dark:text-slate-400">{footer}</div>}
        </div>
      </div>
    </div>
  );
}
