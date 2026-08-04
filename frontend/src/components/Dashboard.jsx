import { useCallback, useEffect, useState } from 'react';
import api from '../api';
import { AppShell, EmptyState, Icon } from './ui';

const columns = [
  { key: 'NEW', label: 'New', color: 'bg-sky-400' },
  { key: 'ONGOING', label: 'Farming', color: 'bg-amber-400' },
  { key: 'COMPLETED', label: 'Waiting', color: 'bg-violet-400' },
  { key: 'CLAIMABLE', label: 'Claimable', color: 'bg-emerald-400' },
  { key: 'ENDED', label: 'Ended', color: 'bg-slate-500' },
];

const cardClass = 'rounded-2xl border border-white/[0.07] bg-[#0d121c]';

function SectionHeader({ icon, title, description, badge }) {
  return <div className="mb-5 flex items-start justify-between gap-3"><div className="flex gap-3"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-indigo-500/10 text-indigo-300"><Icon name={icon} className="h-[18px] w-[18px]" /></span><div><h2 className="text-sm font-semibold text-white">{title}</h2><p className="mt-1 text-xs text-slate-500">{description}</p></div></div>{badge !== undefined && <span className="rounded-full bg-white/[0.05] px-2.5 py-1 text-[11px] font-medium text-slate-400">{badge}</span>}</div>;
}

function Dashboard({ user, onLogout }) {
  const [airdrops, setAirdrops] = useState({});
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [airdropsResponse, dashboardResponse] = await Promise.all([api.get('/airdrops'), api.get('/dashboard')]);
      setAirdrops(airdropsResponse.data);
      setDashboard(dashboardResponse.data);
    } catch (requestError) {
      setError(requestError.response?.data?.detail || 'Unable to load your intelligence workspace.');
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const metrics = [
    { label: 'Active projects', value: dashboard?.active_projects ?? 0, icon: 'target', color: 'text-indigo-300', bg: 'bg-indigo-500/10', detail: 'Across your pipeline' },
    { label: 'Farming profiles', value: dashboard?.profiles ?? 0, icon: 'users', color: 'text-cyan-300', bg: 'bg-cyan-500/10', detail: 'Ready for execution' },
    { label: 'AI recommendations', value: dashboard?.recommendations?.length ?? 0, icon: 'sparkles', color: 'text-violet-300', bg: 'bg-violet-500/10', detail: 'Ranked opportunities' },
    { label: 'Upcoming claims', value: dashboard?.claims?.length ?? 0, icon: 'calendar', color: 'text-emerald-300', bg: 'bg-emerald-500/10', detail: 'Needs attention' },
  ];

  return (
    <AppShell user={user} onLogout={onLogout} eyebrow="Intelligence overview" title={`Good to see you, ${user.username}`} actions={<button onClick={fetchData} disabled={loading} className="flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-2.5 text-xs font-medium text-slate-300 transition hover:bg-white/[0.06] disabled:opacity-50"><Icon name="activity" className="h-4 w-4" />{loading ? 'Syncing…' : 'Refresh data'}</button>}>
      {error && <div role="alert" className="mb-6 flex flex-col gap-3 rounded-2xl border border-red-500/15 bg-red-500/[0.06] px-5 py-4 text-sm text-red-300 sm:flex-row sm:items-center sm:justify-between"><span>{error}</span><button onClick={fetchData} className="font-semibold text-red-200 hover:text-white">Try again</button></div>}

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => <div key={metric.label} className={`${cardClass} animate-enter p-5`}><div className="flex items-start justify-between"><div><p className="text-xs font-medium text-slate-500">{metric.label}</p><p className="mt-3 text-3xl font-semibold tracking-tight text-white">{loading ? '—' : metric.value}</p></div><span className={`grid h-10 w-10 place-items-center rounded-xl ${metric.bg} ${metric.color}`}><Icon name={metric.icon} className="h-5 w-5" /></span></div><p className="mt-4 flex items-center gap-2 text-[11px] text-slate-600"><span className="h-1 w-1 rounded-full bg-slate-600" />{metric.detail}</p></div>)}
      </section>

      <div className="mt-5 grid gap-5 xl:grid-cols-[1.35fr_.65fr]">
        <section className={`${cardClass} p-5 sm:p-6`}>
          <SectionHeader icon="sparkles" title="AI recommendations" description="Highest-value opportunities based on current scoring signals" badge={dashboard?.recommendations?.length || 0} />
          <div className="space-y-2.5">{(dashboard?.recommendations || []).map((item, index) => <div key={`${item.project_name}-${index}`} className="group flex items-center gap-4 rounded-xl border border-white/[0.05] bg-white/[0.018] p-4 transition hover:border-indigo-400/15 hover:bg-indigo-500/[0.025]"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-indigo-500/10 text-sm font-semibold text-indigo-300">{index + 1}</span><div className="min-w-0 flex-1"><p className="truncate text-sm font-medium text-slate-200">{item.project_name}</p><p className="mt-1 text-xs text-slate-600">Recommended action · <span className="text-slate-400">{item.action}</span></p></div><div className="text-right"><p className="text-lg font-semibold text-white">{item.score}</p><p className="text-[10px] uppercase tracking-wider text-slate-600">Score</p></div></div>)}{!loading && !(dashboard?.recommendations || []).length && <EmptyState title="No recommendations yet" description="Scored opportunities will appear here as they become available." />}</div>
        </section>

        <section className={`${cardClass} p-5 sm:p-6`}>
          <SectionHeader icon="calendar" title="Claim center" description="Upcoming snapshots and deadlines" badge={dashboard?.claims?.length || 0} />
          <div className="space-y-3">{(dashboard?.claims || []).map((item, index) => <div key={`${item.project}-${index}`} className="rounded-xl border border-white/[0.05] bg-white/[0.018] p-4"><div className="flex items-center justify-between gap-3"><p className="text-sm font-medium text-slate-200">{item.project}</p><span className="rounded-full bg-amber-500/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-amber-300">{item.status}</span></div><div className="mt-4 grid grid-cols-2 gap-3"><div><p className="text-[10px] uppercase tracking-wider text-slate-600">Snapshot</p><p className="mt-1 text-xs text-slate-400">{item.snapshot_date}</p></div><div><p className="text-[10px] uppercase tracking-wider text-slate-600">Claim date</p><p className="mt-1 text-xs text-slate-400">{item.claim_date}</p></div></div>{item.reminder && <p className="mt-3 border-t border-white/[0.05] pt-3 text-xs leading-5 text-slate-500">{item.reminder}</p>}</div>)}{!loading && !(dashboard?.claims || []).length && <EmptyState icon="calendar" title="Nothing due soon" description="Claim reminders will be organized here." />}</div>
        </section>
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-3">
        <section className={`${cardClass} p-5 sm:p-6`}><SectionHeader icon="wallet" title="Wallet overview" description="Balances and on-chain activity" />
          <div className="space-y-2.5">{(dashboard?.wallets || []).map((item) => <div key={item.chain} className="flex items-center gap-3 rounded-xl bg-white/[0.025] p-3.5"><span className="grid h-9 w-9 place-items-center rounded-full bg-cyan-500/10 text-xs font-semibold uppercase text-cyan-300">{item.chain.slice(0, 2)}</span><div className="min-w-0 flex-1"><p className="text-sm font-medium text-slate-200">{item.chain}</p><p className="mt-0.5 text-[11px] text-slate-600">{item.activity_count} activities · {Number(item.gas_spent).toFixed(2)} gas</p></div><p className="text-sm font-semibold text-white">{Number(item.balance).toFixed(2)}</p></div>)}{!loading && !(dashboard?.wallets || []).length && <EmptyState icon="wallet" title="No wallet data" />}</div>
        </section>

        <section className={`${cardClass} p-5 sm:p-6`}><SectionHeader icon="target" title="Today’s plan" description="Tasks ranked by execution priority" />
          <div className="space-y-2.5">{(dashboard?.planner || []).map((item, index) => <div key={`${item.title}-${index}`} className="rounded-xl bg-white/[0.025] p-3.5"><div className="flex items-start justify-between gap-3"><p className="text-sm font-medium text-slate-200">{item.title}</p><span className="rounded-md bg-indigo-500/10 px-2 py-1 text-[10px] font-semibold uppercase text-indigo-300">{item.priority}</span></div><div className="mt-3 flex items-center gap-4 text-[11px] text-slate-500"><span className="flex items-center gap-1.5"><Icon name="clock" className="h-3.5 w-3.5" />{item.estimate}</span><span>Cost · {item.cost}</span></div></div>)}{!loading && !(dashboard?.planner || []).length && <EmptyState icon="target" title="Plan is clear" />}</div>
        </section>

        <section className={`${cardClass} p-5 sm:p-6`}><SectionHeader icon="compass" title="Discovery feed" description="New candidates from tracked sources" />
          <div className="space-y-2.5">{(dashboard?.discovery_projects || []).map((item, index) => <div key={`${item.name}-${index}`} className="flex items-center gap-3 rounded-xl bg-white/[0.025] p-3.5"><span className="grid h-9 w-9 place-items-center rounded-xl bg-emerald-500/10 text-xs font-semibold text-emerald-300">{item.score}</span><div className="min-w-0 flex-1"><p className="truncate text-sm font-medium text-slate-200">{item.name}</p><p className="mt-0.5 truncate text-[11px] text-slate-600">{item.source} · {item.reward_type}</p></div><Icon name="chevron" className="h-4 w-4 text-slate-700" /></div>)}{!loading && !(dashboard?.discovery_projects || []).length && <EmptyState icon="compass" title="No new discoveries" />}</div>
        </section>
      </div>

      <section className={`${cardClass} mt-5 p-5 sm:p-6`}>
        <SectionHeader icon="automation" title="Automation queue" description="Background operations and scheduled intelligence jobs" badge={`${dashboard?.scheduler?.length || 0} jobs`} />
        <div className="grid gap-3 md:grid-cols-3">{(dashboard?.scheduler || []).map((item, index) => <div key={`${item.name}-${index}`} className="flex items-center gap-3 rounded-xl border border-white/[0.05] bg-white/[0.018] p-4"><span className="relative flex h-8 w-8 items-center justify-center"><span className="absolute h-2.5 w-2.5 animate-ping rounded-full bg-emerald-400/30"/><span className="h-2 w-2 rounded-full bg-emerald-400"/></span><div className="min-w-0 flex-1"><p className="truncate text-sm font-medium text-slate-200">{item.name}</p><p className="mt-1 text-[11px] text-slate-600">Runs every {item.interval_minutes} minutes</p></div><span className="text-[10px] font-semibold uppercase text-emerald-400">{item.status}</span></div>)}{!loading && !(dashboard?.scheduler || []).length && <div className="md:col-span-3"><EmptyState icon="automation" title="No automation jobs" /></div>}</div>
      </section>

      <section className={`${cardClass} mb-20 mt-5 overflow-hidden lg:mb-0`}>
        <div className="border-b border-white/[0.06] p-5 sm:p-6"><SectionHeader icon="activity" title="Airdrop pipeline" description="Every tracked opportunity organized by lifecycle stage" badge={`${columns.reduce((total, column) => total + (airdrops[column.key]?.length || 0), 0)} total`} /></div>
        <div className="grid divide-y divide-white/[0.06] xl:grid-cols-5 xl:divide-x xl:divide-y-0">{columns.map((column) => <div key={column.key} className="min-w-0 p-4"><div className="mb-4 flex items-center justify-between"><div className="flex items-center gap-2"><span className={`h-2 w-2 rounded-full ${column.color}`} /><h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">{column.label}</h3></div><span className="text-xs text-slate-600">{airdrops[column.key]?.length || 0}</span></div><div className="space-y-2.5">{(airdrops[column.key] || []).map((airdrop) => <article key={airdrop.id} className="group rounded-xl border border-white/[0.05] bg-white/[0.02] p-3.5 transition hover:border-white/[0.1] hover:bg-white/[0.035]"><div className="flex items-start justify-between gap-2"><h4 className="truncate text-sm font-medium text-slate-200">{airdrop.project_name}</h4><a href={airdrop.website} target="_blank" rel="noreferrer" aria-label={`Open ${airdrop.project_name}`} className="text-slate-700 transition hover:text-indigo-300"><Icon name="external" className="h-3.5 w-3.5" /></a></div><p className="mt-2 truncate text-[11px] text-slate-600">{airdrop.reward_type}</p><p className="mt-3 flex items-center gap-1.5 text-[10px] text-slate-500"><Icon name="calendar" className="h-3 w-3" />{new Date(airdrop.deadline).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</p></article>)}{!loading && !(airdrops[column.key] || []).length && <p className="rounded-xl border border-dashed border-white/[0.06] px-3 py-6 text-center text-[11px] text-slate-700">No projects</p>}</div></div>)}</div>
      </section>
    </AppShell>
  );
}

export default Dashboard;