import { useState } from 'react';
import api from '../api';
import { Icon } from './ui';

const highlights = [
  ['AI-ranked opportunities', 'Turn fragmented campaign data into clear priorities.'],
  ['Multi-wallet operations', 'Keep every farming identity organized in one workspace.'],
  ['Claim intelligence', 'Stay ahead of snapshots, deadlines, and eligible rewards.'],
];

function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    try {
      const endpoint = isRegister ? '/auth/register' : '/auth/login';
      const payload = isRegister ? { username, password } : new URLSearchParams({ username, password });
      const response = await api.post(endpoint, payload, { headers: { 'Content-Type': isRegister ? 'application/json' : 'application/x-www-form-urlencoded' } });
      if (isRegister) {
        setIsRegister(false);
        setPassword('');
        setMessage('Your workspace is ready. Sign in to continue.');
      } else onLogin(response.data.access_token);
    } catch (requestError) {
      const isBackendOffline = !requestError.response && requestError.request;
      setError(requestError.response?.data?.detail || (isBackendOffline ? 'The backend service is unavailable. Start the API server on port 8000 and try again.' : 'We could not complete that request. Please try again.'));
    } finally { setLoading(false); }
  };

  const switchMode = () => {
    setIsRegister((current) => !current);
    setError('');
    setMessage('');
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#080b12] text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_15%,rgba(99,102,241,0.16),transparent_28%),radial-gradient(circle_at_85%_80%,rgba(34,211,238,0.08),transparent_30%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.035] [background-image:linear-gradient(rgba(255,255,255,.8)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.8)_1px,transparent_1px)] [background-size:48px_48px]" />
      <div className="relative mx-auto grid min-h-screen max-w-[1500px] lg:grid-cols-[1.1fr_.9fr]">
        <section className="hidden flex-col justify-between border-r border-white/[0.06] px-12 py-10 lg:flex xl:px-20 xl:py-14">
          <div className="flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-indigo-500 to-cyan-400 shadow-xl shadow-indigo-500/20"><Icon name="sparkles" /></span><div><p className="text-base font-semibold tracking-tight">Airdrop Intel</p><p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-500">Intelligence platform</p></div></div>
          <div className="max-w-2xl animate-enter">
            <span className="mb-7 inline-flex items-center gap-2 rounded-full border border-indigo-400/15 bg-indigo-500/[0.08] px-3 py-1.5 text-xs font-medium text-indigo-300"><Icon name="sparkles" className="h-3.5 w-3.5" />Built for serious airdrop operators</span>
            <h1 className="max-w-xl text-5xl font-semibold leading-[1.08] tracking-[-0.04em] xl:text-6xl">Find signal.<br/><span className="bg-gradient-to-r from-indigo-300 via-sky-300 to-cyan-300 bg-clip-text text-transparent">Farm smarter.</span></h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-400">A unified intelligence workspace to discover opportunities, coordinate profiles, and never miss a claim.</p>
            <div className="mt-12 grid gap-6 xl:grid-cols-3">{highlights.map(([title, text], index) => <div key={title} className="border-l border-white/10 pl-4"><span className="mb-3 grid h-7 w-7 place-items-center rounded-lg bg-indigo-500/10 text-xs font-semibold text-indigo-300">0{index + 1}</span><p className="text-sm font-medium text-slate-200">{title}</p><p className="mt-1.5 text-xs leading-5 text-slate-500">{text}</p></div>)}</div>
          </div>
          <div className="flex items-center justify-between text-xs text-slate-600"><span>© 2026 Airdrop Intelligence</span><span className="flex items-center gap-2"><Icon name="shield" className="h-4 w-4" />Encrypted session</span></div>
        </section>

        <section className="flex min-h-screen items-center justify-center px-5 py-12 sm:px-10 lg:px-16">
          <div className="w-full max-w-md animate-enter-delay">
            <div className="mb-10 flex items-center gap-3 lg:hidden"><span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-400"><Icon name="sparkles" className="h-5 w-5" /></span><span className="font-semibold">Airdrop Intel</span></div>
            <div className="mb-8"><p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-indigo-400">{isRegister ? 'Create your workspace' : 'Welcome back'}</p><h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">{isRegister ? 'Start operating smarter' : 'Sign in to continue'}</h2><p className="mt-3 text-sm leading-6 text-slate-500">{isRegister ? 'Create an account to organize your airdrop workflow.' : 'Access your intelligence dashboard and farming operations.'}</p></div>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div><label htmlFor="username" className="mb-2 block text-sm font-medium text-slate-300">Username</label><input id="username" name="username" autoComplete="username" required value={username} onChange={(event) => setUsername(event.target.value)} placeholder="Enter your username" className="w-full rounded-xl border border-white/[0.08] bg-white/[0.035] px-4 py-3.5 text-sm text-white outline-none transition placeholder:text-slate-700 focus:border-indigo-400/50 focus:bg-white/[0.05] focus:ring-4 focus:ring-indigo-500/10" /></div>
              <div><div className="mb-2 flex items-center justify-between"><label htmlFor="password" className="text-sm font-medium text-slate-300">Password</label>{!isRegister && <span className="text-xs text-slate-600">Secure access</span>}</div><input id="password" name="password" type="password" autoComplete={isRegister ? 'new-password' : 'current-password'} minLength={isRegister ? 8 : undefined} required value={password} onChange={(event) => setPassword(event.target.value)} placeholder={isRegister ? 'Minimum 8 characters' : 'Enter your password'} className="w-full rounded-xl border border-white/[0.08] bg-white/[0.035] px-4 py-3.5 text-sm text-white outline-none transition placeholder:text-slate-700 focus:border-indigo-400/50 focus:bg-white/[0.05] focus:ring-4 focus:ring-indigo-500/10" /></div>
              {error && <div role="alert" className="flex gap-3 rounded-xl border border-red-500/15 bg-red-500/[0.07] px-4 py-3 text-sm text-red-300"><span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-red-400" />{error}</div>}
              {message && <div role="status" className="flex gap-3 rounded-xl border border-emerald-500/15 bg-emerald-500/[0.07] px-4 py-3 text-sm text-emerald-300"><Icon name="check" className="h-4 w-4 shrink-0" />{message}</div>}
              <button type="submit" disabled={loading} className="group flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-500 px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-950/30 transition hover:bg-indigo-400 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 disabled:opacity-60">{loading ? <><span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />Processing</> : <>{isRegister ? 'Create account' : 'Sign in'}<Icon name="arrow" className="h-4 w-4 transition-transform group-hover:translate-x-0.5" /></>}</button>
            </form>
            <div className="mt-8 flex items-center gap-4"><span className="h-px flex-1 bg-white/[0.06]"/><span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-700">or</span><span className="h-px flex-1 bg-white/[0.06]"/></div>
            <p className="mt-7 text-center text-sm text-slate-500">{isRegister ? 'Already have an account?' : 'New to Airdrop Intel?'} <button type="button" onClick={switchMode} className="font-semibold text-indigo-400 transition hover:text-indigo-300">{isRegister ? 'Sign in' : 'Create an account'}</button></p>
            <p className="mt-10 text-center text-[11px] leading-5 text-slate-700">By continuing, you agree to responsible platform use and secure account practices.</p>
          </div>
        </section>
      </div>
    </main>
  );
}

export default Login;