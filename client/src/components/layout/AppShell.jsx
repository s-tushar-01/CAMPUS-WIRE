import Navbar from './Navbar';
import LeftSidebar from './LeftSidebar';
import RightSidebar from './RightSidebar';
import MobileBottomNav from './MobileBottomNav';

export default function AppShell({ children, right = true, compact = false }) {
  return (
    <div className="page-shell">
      <Navbar />
      <div className={compact ? 'mx-auto min-h-[calc(100vh-64px)] max-w-7xl px-3 pb-20 pt-4 md:px-6' : 'mx-auto grid min-h-[calc(100vh-64px)] max-w-[1480px] grid-cols-1 gap-4 px-3 pb-20 pt-4 md:px-5 lg:grid-cols-[240px_minmax(0,1fr)] xl:grid-cols-[260px_minmax(0,720px)_320px]'}>
        {!compact && <LeftSidebar />}
        <main className={compact ? '' : 'min-w-0'}>{children}</main>
        {!compact && right && <RightSidebar />}
      </div>
      <MobileBottomNav />
    </div>
  );
}
