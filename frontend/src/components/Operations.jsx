import { useCallback, useEffect, useMemo, useState } from 'react';
import api from '../api';
import { AppShell, EmptyState, Icon } from './ui';

const card = 'rounded-xl border border-white/[0.07] bg-[#0d121c]';
const config = {
  tasks: { endpoint: '/tasks', eyebrow: 'Campaign execution', title: 'Task activity', icon: 'list' },
  notifications: { endpoint: '/notifications', eyebrow: 'Workflow events', title: 'Notifications', icon: 'bell' },
  security: { endpoint: '/security/status', eyebrow: 'Runtime posture', title: 'Security center', icon: 'shield' },
};

function Operations({ view, user, onLogout }) {
  const page = config[view];
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const load = useCallback(async () => { setLoading(true); setError(''); try { setData((await api.get(page.endpoint)).data); } catch (requestError) { setError(requestError.response?.data?.detail || `Unable to load ${page.title.toLowerCase()}.`); } finally { setLoading(false); } }, [page]);
  useEffect(() => { load(); }, [load]);
  const items = useMemo(() => Array.isArray(data) ? data : [], [data]);

  return <AppShell user={user} onLogout={onLogout} eyebrow={page.eyebrow} title={page.title} actions={<button onClick={load} disabled={loading} className="flex items-center gap-2 rounded-xl border border-white/[0.08] px-4 py-2.5 text-xs font-semibold text-slate-300 hover:bg-white/5 disabled:opacity-50"><Icon name="activity" className="h-4 w-4" />Refresh</button>}>
    {error && <div role="alert" className="mb-5 rounded-xl border border-red-500/15 bg-red-500/[0.06] p-4 text-sm text-red-300">{error}</div>}
    {loading && <div className="h-48 animate-pulse rounded-xl bg-white/[0.03]" />}
    {!loading && view === 'tasks' && (items.length ? <div className={`${card} overflow-hidden`}><div className="overflow-x-auto"><table className="w-full min-w-[720px] text-left text-sm"><thead className="border-b border-white/[0.07] bg-white/[0.02] text-[11px] uppercase text-slate-500"><tr><th className="p-4">Task</th><th className="p-4">Campaign</th><th className="p-4">Type</th><th className="p-4">Status</th><th className="p-4">Last activity</th></tr></thead><tbody>{items.map((item) => <tr key={item.id} className="border-b border-white/[0.05] last:border-0"><td className="p-4 font-medium text-slate-200">{item.task_name}</td><td className="p-4 text-slate-400">{item.project_name}</td><td className="p-4 text-slate-500">{item.task_type}</td><td className="p-4"><span className={`rounded-full px-2.5 py-1 text-xs ${item.status === 'DONE' ? 'bg-emerald-500/10 text-emerald-300' : item.status === 'FAILED' ? 'bg-red-500/10 text-red-300' : 'bg-white/5 text-slate-400'}`}>{item.status || 'NOT STARTED'}</span></td><td className="p-4 text-slate-500">{item.timestamp ? new Date(item.timestamp).toLocaleString() : 'No activity'}</td></tr>)}</tbody></table></div></div> : <EmptyState icon="list" title="No campaign tasks" description="Add tasks when creating a campaign to track execution here." />)}
    {!loading && view === 'notifications' && (items.length ? <><div className="mb-4 rounded-xl border border-cyan-500/10 bg-cyan-500/[0.04] p-4 text-xs leading-5 text-cyan-100/70">These are application notification events. External Discord, Telegram, or X delivery is best-effort and is not confirmed by this history.</div><div className="space-y-3">{items.map((item) => <article key={item.id} className={`${card} flex gap-4 p-4`}><span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-indigo-500/10 text-indigo-300"><Icon name="bell" className="h-5 w-5" /></span><div><div className="flex flex-wrap items-center gap-2"><p className="text-sm font-medium capitalize text-slate-200">{item.platform}</p><span className="text-xs text-slate-600">{new Date(item.timestamp).toLocaleString()}</span></div><p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-500">{item.message}</p></div></article>)}</div></> : <EmptyState icon="bell" title="No notification events" description="Events appear after campaign status changes or task evidence updates trigger the notification workflow." />)}
    {!loading && view === 'security' && data && <><div className="mb-5 grid gap-3 sm:grid-cols-2"><div className={`${card} p-5`}><p className="text-xs uppercase text-slate-500">Environment</p><p className="mt-2 text-xl font-semibold capitalize text-white">{data.environment}</p></div><div className={`${card} p-5`}><p className="text-xs uppercase text-slate-500">Checks</p><p className="mt-2 text-xl font-semibold text-white">{data.summary.passed} passed · {data.summary.warnings} warnings</p></div></div><div className="grid gap-3 md:grid-cols-2">{data.checks.map((check) => <article key={check.id} className={`${card} flex gap-4 p-5`}><span className={`grid h-10 w-10 shrink-0 place-items-center rounded-lg ${check.status === 'pass' ? 'bg-emerald-500/10 text-emerald-300' : 'bg-amber-500/10 text-amber-300'}`}><Icon name={check.status === 'pass' ? 'check' : 'warning'} className="h-5 w-5" /></span><div><div className="flex items-center gap-2"><h2 className="text-sm font-semibold text-slate-200">{check.label}</h2><span className={`text-[10px] font-semibold uppercase ${check.status === 'pass' ? 'text-emerald-400' : 'text-amber-400'}`}>{check.status}</span></div><p className="mt-2 text-xs leading-5 text-slate-500">{check.detail}</p></div></article>)}</div><p className="mt-5 text-xs leading-5 text-slate-600">These checks report known configuration controls. They are not a guarantee of complete security.</p></>}
  </AppShell>;
}

export default Operations;