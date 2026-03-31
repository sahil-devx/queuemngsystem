// src/pages/UserDashboard.tsx
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';  // ← Add this import
import { Users, Clock, CheckCircle2, Loader2 } from 'lucide-react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useLocation } from 'react-router-dom';
import { getImageUrl } from '../utils/imageUrl';

interface Queue {
  _id: string;
  title: string;
  adminId?: { name: string };
  entryCount?: number;
}

interface SearchQueue {
  queueId: string;
  title: string;
  adminName?: string | null;
}

interface JoinedQueue {
  _id: string;
  joinedAt: string;
  position?: number;
  queueId: { _id: string; title: string; adminId?: { name: string } };
}

interface QueueDetails {
  _id: string;
  title: string;
  adminName: string;
  adminEmail: string;
  contact: string;
  email: string;
  address: string;
  entryCount: number;
  createdAt: string;
}

export default function UserDashboard() {
  const location = useLocation();
  const { user, setUser } = useAuth();
  const [queues, setQueues] = useState<Queue[]>([]);
  const [joined, setJoined] = useState<JoinedQueue[]>([]);
  const [completed, setCompleted] = useState<JoinedQueue[]>([]);
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState<Queue[] | null>(null);
  const [joining, setJoining] = useState<string | null>(null);
  const [joinModalQueue, setJoinModalQueue] = useState<Queue | null>(null);
  const [joinName, setJoinName] = useState(user?.name || '');
  const [joinContact, setJoinContact] = useState(user?.email || '');
  const [joinAddress, setJoinAddress] = useState('');
  const [joinSubject, setJoinSubject] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [details, setDetails] = useState<QueueDetails | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [section, setSection] = useState<'dashboard' | 'my-queues' | 'settings'>('dashboard');
  const [settingsName, setSettingsName] = useState(user?.name || '');
  const [settingsPhone, setSettingsPhone] = useState(user?.phone || '');
  const [settingsEmail, setSettingsEmail] = useState(user?.email || '');
  const [settingsPicture, setSettingsPicture] = useState<File | null>(null);
  const [removePicture, setRemovePicture] = useState(false);
  const [editName, setEditName] = useState(false);
  const [editPhone, setEditPhone] = useState(false);
  const [editEmail, setEditEmail] = useState(false);

  const loadData = async () => {
    try {
      const [queuesRes, joinedRes, completedRes] = await Promise.all([
        api.get('/queue/all'),
        api.get('/queue/joined'),
        api.get('/queue/completed')
      ]);
      setQueues(queuesRes.data.queues || []);
      setJoined(joinedRes.data.entries || []);
      setCompleted(completedRes.data.entries || []);
    } catch (err) {
      setError('Failed to load data');
    } finally {
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  useEffect(() => {
    setSettingsName(user?.name || '');
    setSettingsPhone(user?.phone || '');
    setSettingsEmail(user?.email || '');
  }, [user]);

  useEffect(() => {
    const hash = location.hash || '';
    if (hash.includes('settings-section')) setSection('settings');
    else if (hash.includes('joined-section')) setSection('my-queues');
    else setSection('dashboard');

    const targetId = hash.replace('#', '');
    if (!targetId) return;
    requestAnimationFrame(() => {
      const el = document.getElementById(targetId);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }, [location.hash]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!search.trim()) {
      setSearchResults(null);
      return;
    }
    try {
      const res = await api.get<{ queues: SearchQueue[] }>(`/queue/search?q=${encodeURIComponent(search)}`);
      const normalized = (res.data.queues || []).map((q) => ({
        _id: q.queueId,
        title: q.title,
        adminId: { name: q.adminName || 'Unknown' }
      }));
      setSearchResults(normalized);
    } catch (err) {
      setError('Search failed');
    }
  };

  const openJoinModal = (queue: Queue) => {
    setJoinModalQueue(queue);
    setJoinName(user?.name || '');
    setJoinContact(user?.email || '');
    setJoinAddress('');
    setJoinSubject('');
    setError('');
  };

  const closeJoinModal = () => {
    setJoinModalQueue(null);
  };

  const joinQueue = async (queueId: string) => {
    if (!queueId) {
      setError('Invalid queue selected');
      return;
    }
    setJoining(queueId);
    setError('');
    setSuccess('');
    try {
      await api.post(`/queue/join/${queueId}`, {
        name: joinName.trim(),
        contact: joinContact.trim(),
        address: joinAddress.trim(),
        subject: joinSubject.trim()
      });
      setSuccess('Joined queue successfully');
      closeJoinModal();
      await loadData();
    } catch (err) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to join queue';
      setError(message);
    } finally {
      setJoining(null);
    }
  };

  const leaveQueue = async (queueId: string) => {
    try {
      await api.delete(`/queue/leave/${queueId}`);
      setSuccess('Left queue');
      await loadData();
    } catch (err) {
      setError('Failed to leave');
    }
  };

  const openDetails = async (queueId: string) => {
    if (!queueId) return;
    setDetailsLoading(true);
    setError('');
    try {
      const res = await api.get<{ queue: QueueDetails }>(`/queue/details/${queueId}`);
      setDetails(res.data.queue);
    } catch (err) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to load details';
      setError(message);
    } finally {
      setDetailsLoading(false);
    }
  };

  const removeCompleted = async (entryId: string) => {
    if (!entryId) return;
    try {
      await api.delete(`/queue/completed/${entryId}`);
      setCompleted((prev) => prev.filter((entry) => entry._id !== entryId));
    } catch (err) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Failed to remove completed queue';
      setError(message);
    }
  };

  const saveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('name', settingsName);
      formData.append('phone', settingsPhone);
      formData.append('email', settingsEmail);
      formData.append('removeProfilePicture', String(removePicture));
      if (settingsPicture) formData.append('profilePicture', settingsPicture);
      const res = await api.put('/auth/me', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setUser(res.data.user);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      setSuccess('Profile updated');
      setSettingsPicture(null);
      setRemovePicture(false);
      setEditName(false);
      setEditPhone(false);
      setEditEmail(false);
    } catch (err) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to update profile';
      setError(message);
    }
  };

  const joinedIds = new Set(joined.map(j => j.queueId?._id));

  // Wrap everything with motion.div
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-7xl mx-auto"
    >
      {/* Header */}
      <div id="dashboard-section" className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">User Dashboard</h1>
        <p className="text-slate-500 mt-1">Welcome back, {user?.name}</p>
      </div>

      {section !== 'settings' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <motion.div whileHover={{ y: -2 }} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <Users className="w-5 h-5 text-blue-500 mb-2" />
            <p className="text-2xl font-bold">{joined.length}</p>
            <p className="text-sm text-slate-500">Active Queues</p>
          </motion.div>
          
          <motion.div whileHover={{ y: -2 }} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <CheckCircle2 className="w-5 h-5 text-green-500 mb-2" />
            <p className="text-2xl font-bold">{completed.length}</p>
            <p className="text-sm text-slate-500">Completed</p>
          </motion.div>
          
          <motion.div whileHover={{ y: -2 }} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <Clock className="w-5 h-5 text-purple-500 mb-2" />
            <p className="text-2xl font-bold">{queues.length}</p>
            <p className="text-sm text-slate-500">Available Queues</p>
          </motion.div>
        </div>
      )}

      {/* Messages */}
      {error && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg"
        >
          {error}
        </motion.div>
      )}
      {success && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 p-3 bg-green-50 text-green-600 rounded-lg"
        >
          {success}
        </motion.div>
      )}

      {(section === 'dashboard' || section === 'my-queues') && (
        <>
      {/* Search */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mb-8"
      >
        <h2 className="text-lg font-semibold mb-4">Find Queues</h2>
        <form onSubmit={handleSearch} className="flex gap-3">
          <input
            type="text"
            placeholder="Search by queue or admin name"
            className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button type="submit" className="px-6 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700">
            Search
          </button>
          <button
            type="button"
            onClick={() => { setSearch(''); setSearchResults(null); }}
            className="px-4 py-2 border rounded-lg hover:bg-slate-50"
          >
            Clear
          </button>
        </form>
      </motion.div>

      {/* Search Results */}
      {searchResults !== null && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mb-8"
        >
          <h3 className="font-semibold mb-4">Search Results</h3>
          <div className="grid gap-3">
            {searchResults.map((queue, idx) => (
              <motion.div
                key={queue._id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="flex justify-between items-center p-4 border rounded-lg"
              >
                <div>
                  <p className="font-medium">{queue.title}</p>
                  <p className="text-sm text-slate-500">Admin: {queue.adminId?.name || 'Unknown'}</p>
                </div>
                <button
                  onClick={() => openJoinModal(queue)}
                  disabled={joinedIds.has(queue._id) || joining === queue._id}
                  className="px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 disabled:opacity-50"
                >
                  {joining === queue._id ? <Loader2 className="w-4 h-4 animate-spin" /> : joinedIds.has(queue._id) ? 'Joined' : 'Join'}
                </button>
                <button
                  onClick={() => void openDetails(queue._id)}
                  className="ml-2 px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50"
                >
                  Details
                </button>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Joined Queues */}
      <motion.div 
        id="joined-section"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mb-8"
      >
        <h3 className="font-semibold mb-4">Joined Queues</h3>
        {joined.length === 0 ? (
          <p className="text-slate-500 text-center py-8">No joined queues</p>
        ) : (
          <div className="space-y-3">
            {joined.map((entry, idx) => (
              <motion.div
                key={entry._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="flex justify-between items-center p-4 border rounded-lg"
              >
                <div>
                  <p className="font-medium">{entry.queueId?.title}</p>
                  <p className="text-sm text-slate-500">Position: #{entry.position || '-'}</p>
                  <p className="text-xs text-slate-400 mt-1">Joined: {new Date(entry.joinedAt).toLocaleDateString()}</p>
                </div>
                <button
                  onClick={() => leaveQueue(entry.queueId?._id)}
                  className="px-3 py-1 text-red-600 border border-red-200 rounded-lg hover:bg-red-50"
                >
                  Leave
                </button>
                <button
                  onClick={() => void openDetails(entry.queueId?._id)}
                  className="ml-2 px-3 py-1 text-slate-700 border border-slate-200 rounded-lg hover:bg-slate-50"
                >
                  Details
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Completed Queues */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white p-6 rounded-xl shadow-sm border border-slate-200"
      >
        <h3 className="font-semibold mb-4">Completed Queues</h3>
        {completed.length === 0 ? (
          <p className="text-slate-500 text-center py-8">No completed queues</p>
        ) : (
          <div className="space-y-3">
            {completed.map((entry, idx) => (
              <motion.div
                key={entry._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="p-4 border rounded-lg bg-slate-50 flex items-start justify-between gap-3"
              >
                <div>
                  <p className="font-medium">{entry.queueId?.title}</p>
                  <p className="text-sm text-slate-500">Admin: {entry.queueId?.adminId?.name || 'Unknown'}</p>
                </div>
                <button
                  onClick={() => void removeCompleted(entry._id)}
                  className="text-slate-500 hover:text-red-600 text-lg leading-none"
                  title="Remove from completed"
                >
                  ×
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
        </>
      )}

      {section === 'settings' && (
        <section id="settings-section" className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h2 className="text-xl font-semibold text-slate-900">Settings</h2>
          <p className="text-sm text-slate-500 mt-1">Update your account details and profile picture.</p>
          <form className="mt-5 space-y-5" onSubmit={(e) => void saveSettings(e)}>
            <div className="rounded-xl border border-slate-200 p-4">
              <p className="text-sm font-medium text-slate-700 mb-3">Profile picture</p>
              <div className="flex items-center gap-4">
                <img src={getImageUrl(user?.profilePicture)} alt="profile" className="w-16 h-16 rounded-full object-cover border border-slate-200" />
                <div className="flex flex-wrap gap-2">
                  <label className="px-3 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 cursor-pointer">
                    Change
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        setSettingsPicture(e.target.files?.[0] || null);
                        setRemovePicture(false);
                      }}
                      className="hidden"
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setSettingsPicture(null);
                      setRemovePicture(true);
                    }}
                    className="px-3 py-2 border border-red-200 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 p-4 space-y-3">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm text-slate-600">Name</p>
                <button
                  type="button"
                  onClick={() => setEditName((v) => !v)}
                  className="text-sm font-medium text-brand-600 hover:text-brand-700"
                >
                  {editName ? 'Done' : 'Edit'}
                </button>
              </div>
              <input
                type="text"
                value={settingsName}
                onChange={(e) => setSettingsName(e.target.value)}
                disabled={!editName}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg disabled:bg-slate-50 disabled:text-slate-500"
              />

              <div className="flex items-center justify-between gap-3 pt-2">
                <p className="text-sm text-slate-600">Contact</p>
                <button
                  type="button"
                  onClick={() => setEditPhone((v) => !v)}
                  className="text-sm font-medium text-brand-600 hover:text-brand-700"
                >
                  {editPhone ? 'Done' : 'Edit'}
                </button>
              </div>
              <input
                type="text"
                value={settingsPhone}
                onChange={(e) => setSettingsPhone(e.target.value)}
                disabled={!editPhone}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg disabled:bg-slate-50 disabled:text-slate-500"
              />

              <div className="flex items-center justify-between gap-3 pt-2">
                <p className="text-sm text-slate-600">Email</p>
                <button
                  type="button"
                  onClick={() => setEditEmail((v) => !v)}
                  className="text-sm font-medium text-brand-600 hover:text-brand-700"
                >
                  {editEmail ? 'Done' : 'Edit'}
                </button>
              </div>
              <input
                type="email"
                value={settingsEmail}
                onChange={(e) => setSettingsEmail(e.target.value)}
                disabled={!editEmail}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg disabled:bg-slate-50 disabled:text-slate-500"
              />
            </div>

            <button type="submit" className="w-full px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800">
              Save Changes
            </button>
          </form>
        </section>
      )}

      {details && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-5 shadow-xl">
            {detailsLoading ? (
              <p className="text-sm text-slate-600">Loading details...</p>
            ) : (
              <>
                <h3 className="text-lg font-semibold text-slate-900">{details.title}</h3>
                <div className="mt-3 space-y-2 text-sm text-slate-700">
                  <p><span className="font-medium">Admin:</span> {details.adminName}</p>
                  <p><span className="font-medium">Admin Email:</span> {details.adminEmail || '-'}</p>
                  <p><span className="font-medium">Contact:</span> {details.contact || '-'}</p>
                  <p><span className="font-medium">Queue Email:</span> {details.email || '-'}</p>
                  <p><span className="font-medium">Address:</span> {details.address || '-'}</p>
                  <p><span className="font-medium">Waiting Users:</span> {details.entryCount}</p>
                </div>
              </>
            )}
            <button
              onClick={() => setDetails(null)}
              className="mt-5 w-full rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium hover:bg-slate-50"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {joinModalQueue && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-5 shadow-xl">
            <h3 className="text-lg font-semibold text-slate-900">Join {joinModalQueue.title}</h3>
            <p className="text-sm text-slate-500 mt-1">
              Fill your details before joining this queue.
            </p>

            <form
              className="mt-4 space-y-3"
              onSubmit={(e) => {
                e.preventDefault();
                void joinQueue(joinModalQueue._id);
              }}
            >
              <input
                type="text"
                required
                placeholder="Your name"
                value={joinName}
                onChange={(e) => setJoinName(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
              <input
                type="text"
                required
                placeholder="Contact info (phone/email)"
                value={joinContact}
                onChange={(e) => setJoinContact(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
              <input
                type="text"
                placeholder="Address (optional)"
                value={joinAddress}
                onChange={(e) => setJoinAddress(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
              <input
                type="text"
                placeholder="Subject (optional)"
                value={joinSubject}
                onChange={(e) => setJoinSubject(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={closeJoinModal}
                  className="flex-1 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={joining === joinModalQueue._id}
                  className="flex-1 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-60"
                >
                  {joining === joinModalQueue._id ? 'Joining...' : 'Join Queue'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </motion.div>
  );
}