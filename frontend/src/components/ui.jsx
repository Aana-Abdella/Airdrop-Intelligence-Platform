import { Link, NavLink } from 'react-router-dom';

export function Icon({ name, className = 'h-5 w-5' }) {
  const paths = {
    dashboard: <><rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="7" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/><rect x="14" y="14" width="7" height="7" rx="2"/></>,
    users: <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></>,
    logout: <><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="m16 17 5-5-5-5M21 12H9"/></>,
    sparkles: <><path d="m12 3-1.4 3.6L7 8l3.6 1.4L12 13l1.4-3.6L17 8l-3.6-1.4L12 3Z"/><path d="m5 14-.9 2.1L2 17l2.1.9L5 20l.9-2.1L8 17l-2.1-.9L5 14ZM19 13l-.9 2.1L16 16l2.1.9L19 19l.9-2.1L22 16l-2.1-.9L19 13Z"/></>,
    wallet: <><path d="M20 7V5a2 2 0 0 0-2-2H5a3 3 0 0 0 0 6h15v10a2 2 0 0 1-2 2H5a3 3 0 0 1-3-3V6"/><path d="M16 13h.01"/></>,
    calendar: <><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 11h18"/></>,
    automation: <><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/><circle cx="12" cy="12" r="3"/></>,
    target: <><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/></>,
    compass: <><circle cx="12" cy="12" r="10"/><path d="m16 8-3 5-5 3 3-5 5-3Z"/></>,
    arrow: <><path d="M5 12h14M13 6l6 6-6 6"/></>,
    external: <><path d="M15 3h6v6M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/></>,
    plus: <><path d="M12 5v14M5 12h14"/></>,
    close: <><path d="m18 6-12 12M6 6l12 12"/></>,
    shield: <><path d="M20 13c0 5-3.5 7.5-8 9-4.5-1.5-8-4-8-9V5l8-3 8 3v8Z"/><path d="m9 12 2 2 4-4"/></>,
    chevron: <path d="m9 18 6-6-6-6"/>,
    check: <path d="m5 12 4 4L19 6"/>,
    activity: <path d="M3 12h4l3-8 4 16 3-8h4"/>,
    clock: <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>,
    menu: <><path d="M4 6h16M4 12h16M4 18h16"/></>,
    list: <><path d="M8 6h13M8 12h13M8 18h13"/><path d="M3 6h.01M3 12h.01M3 18h.01"/></>,
    bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"/><path d="M10 21h4"/></>,
    trash: <><path d="M3 6h18M8 6V4h8v2M19 6l-1 15H6L5 6M10 11v6M14 11v6"/></>,
    warning: <><path d="M10.3 2.9 1.8 17a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 2.9a2 2 0 0 0-3.4 0Z"/><path d="M12 9v4M12 17h.01"/></>,
  };

  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}

export function CampaignLink({ href, label = 'Open campaign', className = '' }) {
  let safeHref;
  try {
    const parsed = new URL(String(href));
    if (!['http:', 'https:'].includes(parsed.protocol)) return null;
    safeHref = parsed.href;
  } catch {
    return null;
  }

  return <a href={safeHref} target="_blank" rel="noopener noreferrer" className={`inline-flex items-center gap-1.5 text-xs font-medium text-indigo-300 transition hover:text-white ${className}`}><Icon name="external" className="h-3.5 w-3.5" />{label}</a>;
}

export function Brand({ compact = false }) {
  return (
    <Link to="/" className="flex items-center gap-3">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-400 text-white shadow-lg shadow-indigo-500/20">
        <Icon name="sparkles" className="h-5 w-5" />
      </span>
      {!compact && <span><strong className="block text-[15px] font-semibold tracking-tight text-white">Airdrop Intel</strong><span className="block text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">Intelligence platform</span></span>}
    </Link>
  );
}

export function AppShell({ user, onLogout, children, title, eyebrow, actions }) {
  const nav = [
    { to: '/', label: 'Overview', icon: 'dashboard', end: true },
    { to: '/profiles', label: 'Profiles', icon: 'users' },
    { to: '/airdrops', label: 'Airdrops', icon: 'target' },
    { to: '/tasks', label: 'Tasks', icon: 'list' },
    { to: '/notifications', label: 'Alerts', icon: 'bell' },
    { to: '/security', label: 'Security', icon: 'shield' },
  ];

  return (
    <div className="min-h-screen bg-[#080b12] text-slate-100">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-white/[0.06] bg-[#0b0f18] px-4 py-6 lg:flex">
        <div className="px-2"><Brand /></div>
        <nav className="mt-10 space-y-1.5">
          <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-600">Workspace</p>
          {nav.map((item) => <NavLink key={item.to} {...item} className={({ isActive }) => `group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${isActive ? 'bg-indigo-500/10 text-indigo-300 ring-1 ring-inset ring-indigo-400/10' : 'text-slate-400 hover:bg-white/[0.04] hover:text-white'}`}><Icon name={item.icon} className="h-[18px] w-[18px]" />{item.label}</NavLink>)}
        </nav>
        <div className="mt-auto rounded-2xl border border-white/[0.06] bg-white/[0.025] p-3">
          <div className="flex items-center gap-3">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-indigo-500/15 text-sm font-semibold uppercase text-indigo-300">{user?.username?.slice(0, 2) || 'AI'}</span>
            <div className="min-w-0 flex-1"><p className="truncate text-sm font-medium text-slate-200">{user?.username}</p><p className="text-xs text-emerald-400">● Active session</p></div>
            <button onClick={onLogout} className="rounded-lg p-2 text-slate-500 transition hover:bg-white/5 hover:text-white" aria-label="Sign out"><Icon name="logout" className="h-4 w-4" /></button>
          </div>
        </div>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 border-b border-white/[0.06] bg-[#080b12]/85 backdrop-blur-xl">
          <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
            <div className="lg:hidden"><Brand compact /></div>
            <div className="hidden lg:block"><p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-indigo-400">{eyebrow}</p></div>
            <div className="flex items-center gap-2">
              <span className="hidden items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-xs font-medium text-slate-400 sm:flex"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />Authenticated session</span>
              <button onClick={onLogout} className="rounded-xl border border-white/[0.08] p-2.5 text-slate-400 transition hover:bg-white/5 hover:text-white lg:hidden" aria-label="Sign out"><Icon name="logout" className="h-4 w-4" /></button>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-[1600px] px-4 py-7 sm:px-6 lg:px-8 lg:py-9">
          <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div><p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-indigo-400 lg:hidden">{eyebrow}</p><h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">{title}</h1></div>
            {actions && <div className="flex items-center gap-3">{actions}</div>}
          </div>
          {children}
        </main>

        <nav className="fixed inset-x-3 bottom-3 z-40 flex items-center gap-1 overflow-x-auto rounded-2xl border border-white/10 bg-[#101620]/95 p-2 shadow-2xl backdrop-blur-xl lg:hidden">
          {nav.map((item) => <NavLink key={item.to} {...item} className={({ isActive }) => `flex min-w-[72px] flex-1 flex-col items-center gap-1 rounded-xl px-2 py-2 text-[10px] font-medium ${isActive ? 'bg-indigo-500/15 text-indigo-300' : 'text-slate-500'}`}><Icon name={item.icon} className="h-5 w-5" />{item.label}</NavLink>)}
        </nav>
      </div>
    </div>
  );
}

export function EmptyState({ icon = 'sparkles', title, description }) {
  return <div className="flex min-h-36 flex-col items-center justify-center rounded-2xl border border-dashed border-white/[0.08] px-5 py-8 text-center"><span className="mb-3 grid h-10 w-10 place-items-center rounded-xl bg-white/[0.04] text-slate-500"><Icon name={icon} className="h-5 w-5" /></span><p className="text-sm font-medium text-slate-300">{title}</p>{description && <p className="mt-1 max-w-xs text-xs leading-5 text-slate-600">{description}</p>}</div>;
}