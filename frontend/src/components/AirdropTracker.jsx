import { useCallback, useEffect, useMemo, useState } from 'react';
import api from '../api';
import { AppShell, EmptyState, Icon } from './ui';

const initialForm = { project_name: '', website: '', reward_type: 'Token', reward_amount: '', deadline: '', claim_link: '', tasks: [] };
const inputClass = 'w-full rounded-xl border border-white/[0.08] bg-[#0a0f17] px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-700 focus:border-indigo-400/40 focus:ring-4 focus:ring-indigo-500/10';

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
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [taskDraft, setTaskDraft] = useState({ task_name: '', task_type: 'Social' });

  const fetchAirdrops = useCallback(async () => {
    setLoading(true);
    try { setGroups((await api.get('/airdrops')).data); } catch (requestError) { setError(requestError.response?.data?.detail || 'Unable to load airdrops.'); } finally { setLoading(false); }
  }, []);
  useEffect(() => { fetchAirdrops(); }, [fetchAirdrops]);

  const total = useMemo(() => Object.values(groups).flat().length, [groups]);
  const updateStatus = async (id, status) => {
    try { await api.patch(`/airdrops/${id}/status`, null, { params: { status } }); await fetchAirdrops(); } catch (requestError) { setError(requestError.response?.data?.detail || 'Unable to update status.'); }
  };
  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await api.post('/airdrops', {
        ...formData,
        deadline: new Date(formData.deadline).toISOString(),
        reward_amount: formData.reward_amount || null,
        claim_link: formData.claim_link || null,
      });
      setFormData(initialForm);
      setShowForm(false);
      await fetchAirdrops();
    } catch (requestError) {
      setError(requestError.response?.data?.detail || 'Unable to create this campaign.');
    } finally { setSubmitting(false); }
  };
  const closeForm = () => { setShowForm(false); setFormData(initialForm); };
  const addTask = () => {
    if (!taskDraft.task_name.trim()) return;
    setFormData({ ...formData, tasks: [...formData.tasks, { ...taskDraft, task_name: taskDraft.task_name.trim() }] });
    setTaskDraft({ task_name: '', task_type: 'Social' });
  };

  return <AppShell user={user} onLogout={onLogout} eyebrow="Campaign tracking" title="Airdrop tracker" actions={<div className="flex gap-2"><button onClick={fetchAirdrops} className="flex items-center gap-2 rounded-xl border border-white/[0.08] px-4 py-2.5 text-xs font-semibold text-slate-300 transition hover:bg-white/5 hover:text-white"><Icon name="activity" className="h-4 w-4" />Refresh</button><button onClick={() => setShowForm(true)} className="flex items-center gap-2 rounded-xl bg-indigo-500 px-4 py-2.5 text-xs font-semibold text-white shadow-lg shadow-indigo-950/30 transition hover:bg-indigo-400"><Icon name="plus" className="h-4 w-4" />Add campaign</button></div>}>
    <div className="mb-7 flex flex-wrap gap-3"><div className="rounded-2xl border border-indigo-400/10 bg-indigo-500/[0.06] px-4 py-3"><p className="text-[10px] font-semibold uppercase tracking-wider text-indigo-300">Tracked campaigns</p><p className="mt-1 text-2xl font-semibold text-white">{total}</p></div><div className="rounded-2xl border border-emerald-400/10 bg-emerald-500/[0.05] px-4 py-3"><p className="text-[10px] font-semibold uppercase tracking-wider text-emerald-300">Ready to claim</p><p className="mt-1 text-2xl font-semibold text-white">{(groups.CLAIMABLE || []).length}</p></div></div>
    {error && <div role="alert" className="mb-6 rounded-2xl border border-red-500/15 bg-red-500/[0.06] px-5 py-4 text-sm text-red-300">{error}</div>}
    {loading ? <div className="grid gap-4 lg:grid-cols-5">{columns.map((column) => <div key={column.key} className="h-64 animate-pulse rounded-2xl border border-white/[0.05] bg-white/[0.02]" />)}</div> : total === 0 ? <EmptyState icon="target" title="No airdrops tracked yet" description="Your discovered and manually added campaigns will appear here." /> : <div className="grid gap-4 lg:grid-cols-5">{columns.map((column) => <section key={column.key} className="min-w-0 rounded-2xl border border-white/[0.06] bg-[#0b1019] p-3"><div className="mb-3 flex items-center justify-between px-1"><h2 className={`text-xs font-semibold uppercase tracking-wider ${column.tone}`}>{column.label}</h2><span className="rounded-full bg-white/[0.05] px-2 py-0.5 text-[10px] text-slate-500">{(groups[column.key] || []).length}</span></div><div className="space-y-3">{(groups[column.key] || []).map((item) => <article key={item.id} className="rounded-xl border border-white/[0.06] bg-[#111824] p-3"><div className="flex items-start justify-between gap-2"><h3 className="text-sm font-semibold text-white">{item.project_name}</h3><a href={item.website} target="_blank" rel="noreferrer" className="text-slate-500 hover:text-indigo-300" aria-label={`Open ${item.project_name}`}><Icon name="external" className="h-3.5 w-3.5" /></a></div><p className="mt-2 text-xs text-emerald-300">{item.reward_amount || item.reward_type}</p><p className="mt-2 flex items-center gap-1.5 text-[11px] text-slate-500"><Icon name="clock" className="h-3.5 w-3.5" />{new Date(item.deadline).toLocaleDateString()}</p><select value={item.status} onChange={(event) => updateStatus(item.id, event.target.value)} className="mt-3 w-full rounded-lg border border-white/[0.08] bg-[#0a0f17] px-2 py-2 text-[11px] text-slate-300 outline-none"><option value="NEW">New</option><option value="ONGOING">Ongoing</option><option value="CLAIMABLE">Claimable</option><option value="COMPLETED">Completed</option><option value="ENDED">Ended</option></select></article>)}</div></section>)}</div>}
    {showForm && <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-0 backdrop-blur-sm sm:items-center sm:p-6" onMouseDown={(event) => { if (event.target === event.currentTarget) closeForm(); }}>
      <div role="dialog" aria-modal="true" aria-labelledby="airdrop-dialog-title" className="w-full max-w-xl animate-enter rounded-t-3xl border border-white/[0.08] bg-[#0d121c] shadow-2xl sm:rounded-3xl">
        <div className="flex items-start justify-between border-b border-white/[0.06] px-6 py-5"><div><p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-indigo-400">Campaign intake</p><h2 id="airdrop-dialog-title" className="mt-2 text-xl font-semibold tracking-tight text-white">Add airdrop campaign</h2><p className="mt-1.5 text-xs text-slate-500">Track a campaign from discovery through claim.</p></div><button onClick={closeForm} className="rounded-xl p-2 text-slate-500 transition hover:bg-white/5 hover:text-white" aria-label="Close dialog"><Icon name="close" className="h-5 w-5" /></button></div>
        <form onSubmit={handleSubmit} className="space-y-5 p-6">
          <div className="grid gap-5 sm:grid-cols-2"><div><label htmlFor="airdrop-project" className="mb-2 block text-xs font-medium text-slate-300">Project name *</label><input id="airdrop-project" required value={formData.project_name} onChange={(event) => setFormData({ ...formData, project_name: event.target.value })} className={inputClass} placeholder="Project / protocol name" autoFocus /></div><div><label htmlFor="airdrop-reward-type" className="mb-2 block text-xs font-medium text-slate-300">Reward type *</label><input id="airdrop-reward-type" required value={formData.reward_type} onChange={(event) => setFormData({ ...formData, reward_type: event.target.value })} className={inputClass} placeholder="Token, NFT, points…" /></div></div>
          <div className="grid gap-5 sm:grid-cols-2"><div><label htmlFor="airdrop-website" className="mb-2 block text-xs font-medium text-slate-300">Website *</label><input id="airdrop-website" type="url" required value={formData.website} onChange={(event) => setFormData({ ...formData, website: event.target.value })} className={inputClass} placeholder="https://example.com" /></div><div><label htmlFor="airdrop-reward-amount" className="mb-2 block text-xs font-medium text-slate-300">Reward amount</label><input id="airdrop-reward-amount" value={formData.reward_amount} onChange={(event) => setFormData({ ...formData, reward_amount: event.target.value })} className={inputClass} placeholder="10,000 points / TBA" /></div></div>
          <div className="grid gap-5 sm:grid-cols-2"><div><label htmlFor="airdrop-deadline" className="mb-2 block text-xs font-medium text-slate-300">Deadline *</label><input id="airdrop-deadline" type="datetime-local" required value={formData.deadline} onChange={(event) => setFormData({ ...formData, deadline: event.target.value })} className={inputClass} /></div><div><label htmlFor="airdrop-claim-link" className="mb-2 block text-xs font-medium text-slate-300">Claim link</label><input id="airdrop-claim-link" type="url" value={formData.claim_link} onChange={(event) => setFormData({ ...formData, claim_link: event.target.value })} className={inputClass} placeholder="https://claim.example.com" /></div></div>
          <div><label htmlFor="airdrop-task" className="mb-2 block text-xs font-medium text-slate-300">Campaign tasks</label><div className="flex flex-col gap-2 sm:flex-row"><input id="airdrop-task" value={taskDraft.task_name} onChange={(event) => setTaskDraft({ ...taskDraft, task_name: event.target.value })} className={inputClass} placeholder="Task name" /><select value={taskDraft.task_type} onChange={(event) => setTaskDraft({ ...taskDraft, task_type: event.target.value })} className={`${inputClass} sm:w-40`}><option>Social</option><option>Faucet</option><option>Testnet</option><option>Quiz</option><option>Discord</option></select><button type="button" onClick={addTask} className="rounded-xl border border-white/[0.08] px-4 py-3 text-sm font-medium text-slate-300 hover:bg-white/5">Add</button></div>{formData.tasks.length > 0 && <div className="mt-3 flex flex-wrap gap-2">{formData.tasks.map((task, index) => <button type="button" key={`${task.task_name}-${index}`} onClick={() => setFormData({ ...formData, tasks: formData.tasks.filter((_, itemIndex) => itemIndex !== index) })} className="rounded-lg bg-white/[0.05] px-3 py-2 text-xs text-slate-400" title="Remove task">{task.task_name} · {task.task_type} ×</button>)}</div>}</div>
          <div className="flex flex-col-reverse gap-3 border-t border-white/[0.06] pt-5 sm:flex-row sm:justify-end"><button type="button" onClick={closeForm} className="rounded-xl border border-white/[0.08] px-5 py-3 text-sm font-medium text-slate-400 transition hover:bg-white/5 hover:text-white">Cancel</button><button type="submit" disabled={submitting} className="flex items-center justify-center gap-2 rounded-xl bg-indigo-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-400 disabled:opacity-60">{submitting ? <><span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />Creating…</> : <><Icon name="plus" className="h-4 w-4" />Create campaign</>}</button></div>
        </form>
      </div>
    </div>}
  </AppShell>;
}

export default AirdropTracker;