import Link from 'next/link';
import '@/app/globals.css';

const nav = [
  ['Dashboard', '/admin/dashboard'],
  ['Bookings', '/admin/bookings'],
  ['Crew Calendar', '/admin/calendar'],
  ['Team & Roles', '/admin/team'],
  ['Proof Library', '/admin/showcase'],
  ['Site Content', '/admin/content'],
  ['Analytics', '/admin/analytics'],
  ['Integrations', '/admin/integrations'],
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#f3f1eb] text-zinc-950 lg:grid lg:grid-cols-[250px_1fr]">
      <aside className="border-b border-white/10 bg-black px-5 py-5 text-white lg:sticky lg:top-0 lg:h-screen lg:border-b-0 lg:border-r lg:px-6 lg:py-8">
        <div className="flex items-center justify-between lg:block">
          <div>
            <div className="text-xs font-bold uppercase tracking-[0.18em]">Smith Standard</div>
            <div className="mt-1 text-[10px] uppercase tracking-[0.18em] text-zinc-600">Operating System</div>
          </div>
          <Link href="/" className="text-xs text-zinc-400 hover:text-white lg:mt-6 lg:block">Customer site ↗</Link>
        </div>
        <nav className="mt-5 flex gap-2 overflow-x-auto pb-1 lg:mt-10 lg:flex-col lg:overflow-visible">
          {nav.map(([label, href]) => (
            <Link key={href} href={href} className="shrink-0 rounded-lg px-3 py-2.5 text-sm font-medium text-zinc-400 transition hover:bg-white/10 hover:text-white">
              {label}
            </Link>
          ))}
        </nav>
        <div className="mt-auto hidden pt-10 text-[10px] leading-5 text-zinc-700 lg:block">
          Two-person crew scheduling<br />50% deposit · 50% after service
        </div>
      </aside>
      <main className="min-w-0 px-5 py-8 sm:px-8 lg:px-10 lg:py-10">{children}</main>
    </div>
  );
}
