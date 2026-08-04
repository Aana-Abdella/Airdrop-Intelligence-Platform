import { useCallback, useEffect, useMemo, useState } from 'react';
import api from '../api';
import { AppShell, EmptyState, Icon } from './ui';

const columns = [
  { key: 'NEW', label: 'New', tone: 'text-slate-300' },
  { key: 'ONGOING', label: 'Ongoing', tone: 'text-cyan-300' },
  { key: 'CLAIMABLE', label: 'Claimable', tone: 'text-emerald-300' },
  { key: 'COMPLETED', label: 'Completed', tone: 'text-indigo-300' },
  { key: 'ENDED', label: 'Ended', tone: 'text-slate-500' },
];

function AirdropTracker({ user, onLogout }) {
  const [groups, setGroups] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchAirdrops = useCallback(async () => {
    setLoading(true);
    try { setGroups((await api.get('/airdrops')).data); } catch (requestError) { setError(requestError.response?.data?.detail || 'Unable to load airdrops.'); } finally { setLoading(false); }
  }, []);
  useEffect(() => { fetchAirdrops(); }, [fetchAirdrops]);

  const total = useMemo(() => Object.values(groups).flat().length, [groups]);
  const updateStatus = async (id, status) => {
    try { await api.patch(`/airdrops/${id}/status`, null, { params: { status } }); await fetchAirdrops(); } catch (requestError) { setError(requestError.response?.data?.detail || 'Unable to update status.'); }
  };

  return <AppShell user={user} onLogout={onLogout} eyebrow="Campaign tracking" title="Airdrop tracker" actions={<button onClick={fetchAirdrops} className="flex items-center gap-2 rounded-xl border border-white/[0.08] px-4 py-2.5 text-xs font-semibold text-slate-300 transition hover:bg-white/5 hover:text-white"><Icon name="activity" className="h-4 w-4" />Refresh</button>}>
    <div className="mb-7 flex flex-wrap gap-3"><div className="rounded-2xl border border-indigo-400/10 bg-indigo-500/[0.06] px-4 py-3"><p className="text-[10px] font-semibold uppercase tracking-wider text-indigo-300">Tracked campaigns</p><p className="mt-1 text-2xl font-semibold text-white">{total}</p></div><div className="rounded-2xl border border-emerald-400/10 bg-emerald-500/[0.05] px-4 py-3"><p className="text-[10px] font-semibold uppercase tracking-wider text-emerald-300">Ready to claim</p><p className="mt-1 text-2xl font-semibold text-white">{(groups.CLAIMABLE || []).length}</p></div></div>
    {error && <div role="alert" className="mb-6 rounded-2xl border border-red-500/15 bg-red-500/[0.06] px-5 py-4 text-sm text-red-300">{error}</div>}
    {loading ? <div className="grid gap-4 lg:grid-cols-5">{columns.map((column) => <div key={column.key} className="h-64 animate-pulse rounded-2xl border border-white/[0.05] bg-white/[0.02]" />)}</div> : total === 0 ? <EmptyState icon="target" title="No airdrops tracked yet" description="Your discovered and manually added campaigns will appear here." /> : <div className="grid gap-4 lg:grid-cols-5">{columns.map((column) => <section key={column.key} className="min-w-0 rounded-2xl border border-white/[0.06] bg-[#0b1019] p-3"><div className="mb-3 flex items-center justify-between px-1"><h2 className={`text-xs font-semibold uppercase tracking-wider ${column.tone}`}>{column.label}</h2><span className="rounded-full bg-white/[0.05] px-2 py-0.5 text-[10px] text-slate-500">{(groups[column.key] || []).length}</span></div><div className="space-y-3">{(groups[column.key] || []).map((item) => <article key={item.id} className="rounded-xl border border-white/[0.06] bg-[#111824] p-3"><div className="flex items-start justify-between gap-2"><h3 className="text-sm font-semibold text-white">{item.project_name}</h3><a href={item.website} target="_blank" rel="noreferrer" className="text-slate-500 hover:text-indigo-300" aria-label={`Open ${item.project_name}`}><Icon name="external" className="h-3.5 w-3.5" /></a></div><p className="mt-2 text-xs text-emerald-300">{item.reward_amount || item.reward_type}</p><p className="mt-2 flex items-center gap-1.5 text-[11px] text-slate-500"><Icon name="clock" className="h-3.5 w-3.5" />{new Date(item.deadline).toLocaleDateString()}</p><select value={item.status} onChange={(event) => updateStatus(item.id, event.target.value)} className="mt-3 w-full rounded-lg border border-white/[0.08] bg-[#0a0f17] px-2 py-2 text-[11px] text-slate-300 outline-none"><option value="NEW">New</option><option value="ONGOING">Ongoing</option><option value="CLAIMABLE">Claimable</option><option value="COMPLETED">Completed</option><option value="ENDED">Ended</option></select></article>)}</div></section>)}</div>}
  </AppShell>;
}

export default AirdropTracker;