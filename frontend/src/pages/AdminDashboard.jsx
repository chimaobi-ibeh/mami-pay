import React, { useState, useEffect } from 'react';
import { ShieldCheck, Users, Activity, Settings, AlertCircle, CreditCard, Search, Check } from 'lucide-react';
import api from '../services/api';

const fmt = (n) => `₦${parseFloat(n || 0).toLocaleString()}`;

const AdminDashboard = ({ user }) => {
  const [stats, setStats] = useState({ totalUsers: 0, totalTransactions: 0 });
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [overdraftInputs, setOverdraftInputs] = useState({});
  const [saving, setSaving] = useState({});
  const [saveMsg, setSaveMsg] = useState({});
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem('token');
  const config = { headers: { Authorization: `Bearer ${token}` } };

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [statsRes, usersRes] = await Promise.all([
          api.get('/api/admin/stats', config),
          api.get('/api/admin/users', config),
        ]);
        setStats(statsRes.data);
        setUsers(usersRes.data.users);
        const inputs = {};
        usersRes.data.users.forEach(u => {
          inputs[u.id] = u.Wallet?.overdraftLimit || 0;
        });
        setOverdraftInputs(inputs);
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []); // eslint-disable-line

  const saveOverdraft = async (userId) => {
    setSaving(s => ({ ...s, [userId]: true }));
    try {
      await api.put(`/api/admin/users/${userId}/overdraft`, { limit: overdraftInputs[userId] }, config);
      setSaveMsg(m => ({ ...m, [userId]: 'Saved!' }));
      setTimeout(() => setSaveMsg(m => ({ ...m, [userId]: '' })), 2000);
    } catch {
      setSaveMsg(m => ({ ...m, [userId]: 'Error' }));
    } finally {
      setSaving(s => ({ ...s, [userId]: false }));
    }
  };

  const filtered = users.filter(u =>
    `${u.firstName} ${u.lastName} ${u.email} ${u.nyscServiceNumber || ''}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-500">System-wide overview and management.</p>
        </div>
        <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-all">
          <Settings size={20} />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-green-50 text-[#075f47] rounded-lg"><Users size={24} /></div>
          </div>
          <p className="text-gray-500 text-sm mb-1">Total Users</p>
          <h2 className="text-2xl font-bold text-gray-900">{loading ? '...' : stats.totalUsers}</h2>
          <p className="mt-2 text-xs text-green-600 font-medium">Registered accounts</p>
        </div>
        <div className="card">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Activity size={24} /></div>
          </div>
          <p className="text-gray-500 text-sm mb-1">Total Transactions</p>
          <h2 className="text-2xl font-bold text-gray-900">{loading ? '...' : stats.totalTransactions}</h2>
          <p className="mt-2 text-xs text-blue-600 font-medium">All time</p>
        </div>
        <div className="card">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-red-50 text-red-600 rounded-lg"><AlertCircle size={24} /></div>
          </div>
          <p className="text-gray-500 text-sm mb-1">System Alerts</p>
          <h2 className="text-2xl font-bold text-gray-900">0</h2>
          <p className="mt-2 text-xs text-red-600 font-medium">All systems normal</p>
        </div>
        <div className="card">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-purple-50 text-purple-600 rounded-lg"><ShieldCheck size={24} /></div>
          </div>
          <p className="text-gray-500 text-sm mb-1">Security Score</p>
          <h2 className="text-2xl font-bold text-gray-900">98%</h2>
          <p className="mt-2 text-xs text-purple-600 font-medium">Excellent</p>
        </div>
      </div>

      {/* User & Overdraft Management */}
      <div className="card">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div className="flex items-center gap-2">
            <CreditCard size={20} className="text-[#075f47]" />
            <h3 className="text-lg font-bold">Users & Overdraft Management</h3>
          </div>
          <div className="relative w-full md:w-64">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, email, NYSC no..."
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-[#075f47] focus:border-[#075f47]"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8 text-gray-400">Loading users...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="text-xs font-bold text-gray-400 uppercase border-b border-gray-100">
                  <th className="pb-3 pr-4">User</th>
                  <th className="pb-3 pr-4">Role</th>
                  <th className="pb-3 pr-4">NYSC No.</th>
                  <th className="pb-3 pr-4">Balance</th>
                  <th className="pb-3 pr-4">Overdraft Limit (₦)</th>
                  <th className="pb-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(u => (
                  <tr key={u.id} className="hover:bg-gray-50">
                    <td className="py-3 pr-4">
                      <p className="font-medium text-gray-900">{u.firstName} {u.lastName}</p>
                      <p className="text-xs text-gray-400">{u.email}</p>
                    </td>
                    <td className="py-3 pr-4">
                      <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                        u.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                        u.role === 'vendor' ? 'bg-blue-100 text-blue-700' :
                        'bg-green-100 text-[#075f47]'
                      }`}>{u.role}</span>
                    </td>
                    <td className="py-3 pr-4 text-xs text-gray-500">{u.nyscServiceNumber || '—'}</td>
                    <td className="py-3 pr-4 font-medium">{fmt(u.Wallet?.balance)}</td>
                    <td className="py-3 pr-4">
                      <input
                        type="number" min="0"
                        className="w-28 px-2 py-1 border border-gray-200 rounded-lg text-sm focus:ring-[#075f47] focus:border-[#075f47]"
                        value={overdraftInputs[u.id] ?? 0}
                        onChange={e => setOverdraftInputs(prev => ({ ...prev, [u.id]: e.target.value }))}
                      />
                    </td>
                    <td className="py-3">
                      <button
                        onClick={() => saveOverdraft(u.id)}
                        disabled={saving[u.id]}
                        className="flex items-center gap-1 px-3 py-1 text-xs font-medium text-white bg-[#075f47] rounded-lg hover:bg-[#064e3b] disabled:opacity-50 transition-colors"
                      >
                        {saveMsg[u.id] ? <><Check size={12} /> {saveMsg[u.id]}</> : saving[u.id] ? 'Saving...' : 'Set'}
                      </button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={6} className="py-8 text-center text-gray-400">No users found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="card">
        <h3 className="text-lg font-bold mb-4">System Status</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {['API Server', 'Database', 'Auth Service', 'Payment Gateway'].map(s => (
            <div key={s} className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">{s}</span>
              <span className="text-xs font-bold text-[#075f47] uppercase">Online</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
