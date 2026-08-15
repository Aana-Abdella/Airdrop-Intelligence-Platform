import { useCallback, useEffect, useState } from 'react';
import api from '../api';
import { AppShell, EmptyState, Icon } from './ui';

const initialForm = { label: '', email: '', wallet: '', chrome_port: 9222, chrome_profile: '', x_handle: '', discord_handle: '', ip_address: '', location: '', notes: '' };
const inputClass = 'w-full rounded-xl border border-white/[0.08] bg-[#0a0f17] px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-700 focus:border-indigo-400/40 focus:ring-4 focus:ring-indigo-500/10';

function ProfileManager({ user, onLogout }) {
  const [profiles, setProfiles] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const fetchProfiles = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get('/profiles');
      setProfiles(response.data);
    } catch (requestError) {
      setError(requestError.response?.data?.detail || 'Unable to load farming profiles.');
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchProfiles(); }, [fetchProfiles]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await api.post('/profiles', { ...formData, chrome_port: Number(formData.chrome_port) });
      setFormData(initialForm);
      setShowForm(false);
      await fetchProfiles();
    } catch (requestError) {
      setError(requestError.response?.data?.detail || 'Unable to create this profile.');
    } finally { setSubmitting(false); }
  };

  const closeForm = () => { setShowForm(false); setFormData(initialForm); };
  const removeProfile = async (profile) => {
    if (!window.confirm(`Remove ${profile.label || profile.email}? Profiles with task history are preserved.`)) return;
    try { await api.delete(`/profiles/${profile.id}`); await fetchProfiles(); } catch (requestError) { setError(requestError.response?.data?.detail || 'Unable to remove this profile.'); }
  };

  return (
    <AppShell user={user} onLogout={onLogout} eyebrow="Identity operations" title="Farming profiles" actions={<button onClick={() => setShowForm(true)} className="flex items-center gap-2 rounded-xl bg-indigo-500 px-4 py-2.5 text-xs font-semibold text-white shadow-lg shadow-indigo-950/30 transition hover:bg-indigo-400"><Icon name="plus" className="h-4 w-4" />New profile</button>}>
      <div className="mb-7 max-w-2xl"><p className="text-sm leading-6 text-slate-500">Organize isolated browser identities, proxy configurations, and operational notes for consistent multi-profile farming.</p></div>

      {error && <div role="alert" className="mb-6 flex items-center justify-between rounded-2xl border border-red-500/15 bg-red-500/[0.06] px-5 py-4 text-sm text-red-300"><span>{error}</span><button onClick={fetchProfiles} className="font-semibold text-red-200">Retry</button></div>}

      <section className="mb-20 grid gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 lg:mb-0">
        {profiles.map((profile, index) => <article key={profile.id} className="group rounded-2xl border border-white/[0.07] bg-[#0d121c] p-5 transition hover:border-indigo-400/15">
          <div className="flex items-start justify-between"><span className="grid h-11 w-11 place-items-center rounded-xl bg-indigo-500/15 text-sm font-semibold uppercase text-indigo-300">{(profile.label || profile.email || 'WA').slice(0, 2)}</span><button onClick={() => removeProfile(profile)} className="rounded-lg p-2 text-slate-600 hover:bg-red-500/10 hover:text-red-300" aria-label={`Remove ${profile.label || profile.email}`}><Icon name="trash" className="h-4 w-4" /></button></div>
          <div className="mt-5"><h2 className="truncate text-base font-semibold text-white">{profile.label || profile.email}</h2><p className="mt-1 text-xs text-slate-600">Profile #{String(index + 1).padStart(2, '0')} · {profile.location || 'Unassigned location'}</p></div>
          <div className="mt-5 space-y-3 border-t border-white/[0.06] pt-4">
            <div><p className="text-[10px] font-semibold uppercase tracking-wider text-slate-600">Wallet</p><p className="mt-1.5 truncate text-xs text-slate-400">{profile.wallet}</p></div>
            <div><p className="text-[10px] font-semibold uppercase tracking-wider text-slate-600">Chrome profile</p><p className="mt-1.5 truncate text-xs text-slate-400">{profile.chrome_profile || `Port ${profile.chrome_port}`}</p></div>
            <div className="flex gap-3 text-xs text-slate-500"><span>{profile.x_handle || 'No X handle'}</span><span>·</span><span>{profile.discord_handle || 'No Discord'}</span></div>
          </div>
          {profile.notes && <p className="mt-4 rounded-xl bg-white/[0.025] px-3 py-2.5 text-xs leading-5 text-slate-500">{profile.notes}</p>}
        </article>)}

        {!loading && profiles.length === 0 && <div className="md:col-span-2 xl:col-span-3 2xl:col-span-4"><EmptyState icon="users" title="Create your first farming profile" description="Separate identities help you operate campaigns cleanly and consistently." /></div>}
        {loading && [1, 2, 3].map((item) => <div key={item} className="h-64 animate-pulse rounded-2xl border border-white/[0.05] bg-white/[0.02]" />)}
      </section>

      {showForm && <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-0 backdrop-blur-sm sm:items-center sm:p-6" onMouseDown={(event) => { if (event.target === event.currentTarget) closeForm(); }}>
        <div role="dialog" aria-modal="true" aria-labelledby="profile-dialog-title" className="w-full max-w-xl animate-enter rounded-t-3xl border border-white/[0.08] bg-[#0d121c] shadow-2xl sm:rounded-3xl">
          <div className="flex items-start justify-between border-b border-white/[0.06] px-6 py-5"><div><p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-indigo-400">Identity setup</p><h2 id="profile-dialog-title" className="mt-2 text-xl font-semibold tracking-tight text-white">Create farming profile</h2><p className="mt-1.5 text-xs text-slate-500">Configure a distinct environment for campaign execution.</p></div><button onClick={closeForm} className="rounded-xl p-2 text-slate-500 transition hover:bg-white/5 hover:text-white" aria-label="Close dialog"><Icon name="close" className="h-5 w-5" /></button></div>
          <form onSubmit={handleSubmit} className="space-y-5 p-6">
            <div className="grid gap-5 sm:grid-cols-2"><div><label htmlFor="profile-label" className="mb-2 block text-xs font-medium text-slate-300">Profile label</label><input id="profile-label" value={formData.label} onChange={(event) => setFormData({ ...formData, label: event.target.value })} className={inputClass} placeholder="Primary wallet" autoFocus /></div><div><label htmlFor="profile-email" className="mb-2 block text-xs font-medium text-slate-300">Account email *</label><input id="profile-email" type="email" required value={formData.email} onChange={(event) => setFormData({ ...formData, email: event.target.value })} className={inputClass} placeholder="you@example.com" /></div></div>
            <div><label htmlFor="profile-wallet" className="mb-2 block text-xs font-medium text-slate-300">Public wallet address *</label><input id="profile-wallet" required value={formData.wallet} onChange={(event) => setFormData({ ...formData, wallet: event.target.value })} className={inputClass} placeholder="Public address only" /><p className="mt-2 text-[11px] text-amber-300/80">Never enter a private key or seed phrase.</p></div>
            <div className="grid gap-5 sm:grid-cols-2"><div><label htmlFor="profile-chrome" className="mb-2 block text-xs font-medium text-slate-300">Chrome profile name</label><input id="profile-chrome" value={formData.chrome_profile} onChange={(event) => setFormData({ ...formData, chrome_profile: event.target.value })} className={inputClass} placeholder="Default / Profile 1" /></div><div><label htmlFor="profile-port" className="mb-2 block text-xs font-medium text-slate-300">Chrome debugging port *</label><input id="profile-port" type="number" min="1" required value={formData.chrome_port} onChange={(event) => setFormData({ ...formData, chrome_port: event.target.value })} className={inputClass} /></div></div>
            <div className="grid gap-5 sm:grid-cols-2"><div><label htmlFor="profile-x" className="mb-2 block text-xs font-medium text-slate-300">X / Twitter handle</label><input id="profile-x" value={formData.x_handle} onChange={(event) => setFormData({ ...formData, x_handle: event.target.value })} className={inputClass} placeholder="@username" /></div><div><label htmlFor="profile-discord" className="mb-2 block text-xs font-medium text-slate-300">Discord handle</label><input id="profile-discord" value={formData.discord_handle} onChange={(event) => setFormData({ ...formData, discord_handle: event.target.value })} className={inputClass} placeholder="username#0000" /></div></div>
            <div className="grid gap-5 sm:grid-cols-2"><div><label htmlFor="profile-ip" className="mb-2 block text-xs font-medium text-slate-300">IP / proxy label</label><input id="profile-ip" value={formData.ip_address} onChange={(event) => setFormData({ ...formData, ip_address: event.target.value })} className={inputClass} placeholder="Optional network label" /></div><div><label htmlFor="profile-location" className="mb-2 block text-xs font-medium text-slate-300">Location</label><input id="profile-location" value={formData.location} onChange={(event) => setFormData({ ...formData, location: event.target.value })} className={inputClass} placeholder="Region or workspace" /></div></div>
            <div><label htmlFor="profile-notes" className="mb-2 block text-xs font-medium text-slate-300">Operational notes</label><textarea id="profile-notes" rows="2" value={formData.notes} onChange={(event) => setFormData({ ...formData, notes: event.target.value })} className={`${inputClass} resize-none`} placeholder="Wallet purpose, campaign assignments, reminders…" /></div>
            <div className="flex flex-col-reverse gap-3 border-t border-white/[0.06] pt-5 sm:flex-row sm:justify-end"><button type="button" onClick={closeForm} className="rounded-xl border border-white/[0.08] px-5 py-3 text-sm font-medium text-slate-400 transition hover:bg-white/5 hover:text-white">Cancel</button><button type="submit" disabled={submitting} className="flex items-center justify-center gap-2 rounded-xl bg-indigo-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-400 disabled:opacity-60">{submitting ? <><span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />Creating…</> : <><Icon name="plus" className="h-4 w-4" />Create profile</>}</button></div>
          </form>
        </div>
      </div>}
    </AppShell>
  );
}

export default ProfileManager;