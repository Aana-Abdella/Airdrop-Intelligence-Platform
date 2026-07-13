import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

function ProfileManager({ user, onLogout }) {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    wallet: '',
    chrome_port: '',
    ip_address: '',
    location: '',
    notes: '',
  });

  useEffect(() => {
    fetchProfiles();
  }, []);

  const fetchProfiles = async () => {
    try {
      const response = await axios.get('http://localhost:8000/profiles');
      setProfiles(response.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:8000/profiles', {
        ...formData,
        chrome_port: parseInt(formData.chrome_port),
      });
      setFormData({ email: '', wallet: '', chrome_port: '', ip_address: '', location: '', notes: '' });
      setShowForm(false);
      fetchProfiles();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 p-4 text-slate-100">
      <div className="mx-auto max-w-4xl">
        <header className="mb-6 flex flex-col gap-3 rounded-3xl border border-slate-700 bg-slate-900/80 p-6 shadow-xl shadow-slate-950/20 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-sky-400">Profile Manager</p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white">Manage Your Profiles</h1>
            <p className="mt-2 max-w-2xl text-slate-400">Create and manage airdrop farming identities.</p>
          </div>
          <div className="flex gap-4">
            <Link
              to="/"
              className="rounded-2xl bg-slate-800 px-4 py-2 text-sm font-medium text-slate-100 transition hover:bg-slate-700"
            >
              Back to Dashboard
            </Link>
            <button
              onClick={onLogout}
              className="rounded-2xl bg-red-800 px-4 py-2 text-sm font-medium text-slate-100 transition hover:bg-red-700"
            >
              Logout
            </button>
          </div>
        </header>

        <div className="mb-6">
          <button
            onClick={() => setShowForm(!showForm)}
            className="rounded-2xl bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-700"
          >
            {showForm ? 'Cancel' : 'Add New Profile'}
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className="mb-6 rounded-3xl border border-slate-700 bg-slate-900/80 p-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-slate-300">Email</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="mt-1 block w-full rounded-md border-slate-700 bg-slate-800 text-white px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300">Wallet</label>
                <input
                  type="text"
                  required
                  value={formData.wallet}
                  onChange={(e) => setFormData({ ...formData, wallet: e.target.value })}
                  className="mt-1 block w-full rounded-md border-slate-700 bg-slate-800 text-white px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300">Chrome Port</label>
                <input
                  type="number"
                  required
                  value={formData.chrome_port}
                  onChange={(e) => setFormData({ ...formData, chrome_port: e.target.value })}
                  className="mt-1 block w-full rounded-md border-slate-700 bg-slate-800 text-white px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300">IP Address</label>
                <input
                  type="text"
                  required
                  placeholder="192.168.1.101"
                  value={formData.ip_address}
                  onChange={(e) => setFormData({ ...formData, ip_address: e.target.value })}
                  className="mt-1 block w-full rounded-md border-slate-700 bg-slate-800 text-white px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300">Location</label>
                <input
                  type="text"
                  required
                  placeholder="New York, USA"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="mt-1 block w-full rounded-md border-slate-700 bg-slate-800 text-white px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300">Notes</label>
                <input
                  type="text"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="mt-1 block w-full rounded-md border-slate-700 bg-slate-800 text-white px-3 py-2"
                />
              </div>
            </div>
            <div className="mt-4">
              <button
                type="submit"
                className="rounded-2xl bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
              >
                Create Profile
              </button>
            </div>
          </form>
        )}

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {loading ? (
            <p className="text-slate-400">Loading profiles...</p>
          ) : (
            profiles.map((profile) => (
              <div key={profile.id} className="rounded-3xl border border-slate-700 bg-slate-900/80 p-4">
                <h3 className="text-lg font-semibold text-white">Profile {profile.id}</h3>
                <div className="mt-2 space-y-1 text-sm text-slate-400">
                  <p>Email: {profile.email}</p>
                  <p>Wallet: {profile.wallet.slice(0, 10)}...</p>
                  <p>Chrome Port: {profile.chrome_port}</p>
                  <p>IP Address: {profile.ip_address}</p>
                  <p>Location: {profile.location}</p>
                  {profile.notes && <p>Notes: {profile.notes}</p>}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default ProfileManager;