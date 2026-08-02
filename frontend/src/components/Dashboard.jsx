import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const statusStyles = {
  NEW: 'bg-sky-600',
  ONGOING: 'bg-amber-500',
  COMPLETED: 'bg-violet-600',
  CLAIMABLE: 'bg-emerald-600',
  ENDED: 'bg-slate-600',
};

const columns = [
  { key: 'NEW', label: 'New Airdrops' },
  { key: 'ONGOING', label: 'Ongoing Farming' },
  { key: 'COMPLETED', label: 'Completed (Waiting Claim)' },
  { key: 'CLAIMABLE', label: 'Claimable Now' },
  { key: 'ENDED', label: 'Ended' },
];

function Dashboard({ user, onLogout }) {
  const [airdrops, setAirdrops] = useState({});
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [airdropsResponse, dashboardResponse] = await Promise.all([
        axios.get('http://localhost:8000/airdrops'),
        axios.get('http://localhost:8000/dashboard'),
      ]);
      setAirdrops(airdropsResponse.data);
      setDashboard(dashboardResponse.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 p-4 text-slate-100">
      <div className="mx-auto max-w-7xl">
        <header className="mb-6 flex flex-col gap-3 rounded-3xl border border-slate-700 bg-slate-900/80 p-6 shadow-xl shadow-slate-950/20 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-sky-400">Airdrop Intelligence Platform</p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white">Version 2 Dashboard</h1>
            <p className="mt-2 max-w-2xl text-slate-400">Welcome, {user.username}. Track, analyze, and prioritize airdrop opportunities with AI-guided insights.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/profiles"
              className="rounded-2xl bg-slate-800 px-4 py-2 text-sm font-medium text-slate-100 transition hover:bg-slate-700"
            >
              Manage Profiles
            </Link>
            <button
              onClick={onLogout}
              className="rounded-2xl bg-red-800 px-4 py-2 text-sm font-medium text-slate-100 transition hover:bg-red-700"
            >
              Logout
            </button>
          </div>
        </header>

        <section className="mb-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-3xl border border-slate-700 bg-slate-900/80 p-5 shadow-lg shadow-slate-950/20">
            <p className="text-sm text-slate-400">Active Projects</p>
            <p className="mt-3 text-3xl font-semibold text-white">{dashboard?.active_projects ?? 0}</p>
          </div>
          <div className="rounded-3xl border border-slate-700 bg-slate-900/80 p-5 shadow-lg shadow-slate-950/20">
            <p className="text-sm text-slate-400">Tracked Profiles</p>
            <p className="mt-3 text-3xl font-semibold text-white">{dashboard?.profiles ?? 0}</p>
          </div>
          <div className="rounded-3xl border border-slate-700 bg-slate-900/80 p-5 shadow-lg shadow-slate-950/20">
            <p className="text-sm text-slate-400">AI Recommendations</p>
            <p className="mt-3 text-3xl font-semibold text-white">{dashboard?.recommendations?.length ?? 0}</p>
          </div>
        </section>

        <section className="mb-6 rounded-3xl border border-slate-700 bg-slate-900/80 p-5 shadow-lg shadow-slate-950/20">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">AI Recommendations</h2>
            <span className="text-sm text-slate-400">Prioritized by scoring heuristics</span>
          </div>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {(dashboard?.recommendations || []).map((item) => (
              <div key={item.project_name} className="rounded-2xl border border-slate-700 bg-slate-950/70 p-4">
                <p className="text-sm font-semibold text-white">{item.project_name}</p>
                <p className="mt-2 text-sm text-slate-400">Score: {item.score}/100</p>
                <p className="mt-2 inline-flex rounded-full bg-sky-600/20 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-sky-300">
                  {item.action}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="grid gap-4 xl:grid-cols-5">
          {columns.map((column) => (
            <div key={column.key} className="rounded-3xl border border-slate-700 bg-slate-900/80 p-4 shadow-lg shadow-slate-950/20">
              <h2 className="mb-4 text-lg font-semibold text-slate-100">{column.label}</h2>
              {loading ? (
                <p className="text-slate-400">Loading...</p>
              ) : (
                <div className="space-y-4">
                  {(airdrops[column.key] || []).map((airdrop) => (
                    <article key={airdrop.id} className="rounded-3xl border border-slate-700 bg-slate-950/80 p-4">
                      <div className="mb-3 flex items-center justify-between gap-3">
                        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-white ${statusStyles[airdrop.status] || 'bg-slate-600'}`}>
                          {airdrop.status}
                        </span>
                        <span className="text-xs text-slate-500">Deadline: {new Date(airdrop.deadline).toLocaleDateString()}</span>
                      </div>
                      <h3 className="text-lg font-semibold text-white">{airdrop.project_name}</h3>
                      <p className="mt-2 text-sm text-slate-400">Reward: {airdrop.reward_type}</p>
                      <div className="mt-4 flex flex-wrap gap-2">
                        <a
                          href={airdrop.website}
                          target="_blank"
                          rel="noreferrer"
                          className="rounded-2xl bg-slate-800 px-3 py-2 text-sm font-medium text-slate-100 transition hover:bg-slate-700"
                        >
                          Open website
                        </a>
                      </div>
                    </article>
                  ))}
                  {(!airdrops[column.key] || airdrops[column.key].length === 0) && !loading && (
                    <p className="text-sm text-slate-500">No airdrops in this phase.</p>
                  )}
                </div>
              )}
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}

export default Dashboard;