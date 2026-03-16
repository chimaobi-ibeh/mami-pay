import React, { useState, useEffect, useCallback } from 'react';
import {
  ShieldCheck, Users, Activity, Settings, AlertCircle, CreditCard,
  Search, Check, ChevronLeft, ChevronRight, ClipboardList
} from 'lucide-react';
import api from '../services/api';

const fmt = (n) => `₦${parseFloat(n || 0).toLocaleString()}`;

const WALLET_STATUS_COLORS = {
  active: 'bg-green-100 text-[#075f47]',
  suspended: 'bg-yellow-100 text-yellow-700',
  closed: 'bg-red-100 text-red-700',
};

const AdminDashboard = () => {
  const [tab, setTab] = useState('users');
  const [stats, setStats] = useState({ totalUsers: 0, totalTransactions: 0 });
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [overdraftInputs, setOverdraftInputs] = useState({});
  const [saving, setSaving] = useState({});
  const [saveMsg, setSaveMsg] = useState({});
  const [statusUpdating, setStatusUpdating] = useState({});
  const [loading, setLoading] = useState(true);

  const [logs, setLogs] = useState([]);
  const [logPage, setLogPage] = useState(1);
  const [logTotalPages, setLogTotalPages] = useState(1);
  const [logAction, setLogAction] = useState('');
  const [logsLoading, setLogsLoading] = useState(false);

  const token = localStorage.getItem('token');
  const config = { headers: { Authorization: `Bearer ${token}` } };

  const fetchUsers = useCallback(async (p, s) => {
    setLoading(true);
    try {
      const [statsRes, usersRes] = await Promise.all([
        api.get('/api/admin/stats', config),
        api.get(`/api/admin/users?page=${p}&limit=10&search=${encodeURIComponent(s)}`, config),
      ]);
      setStats(statsRes.data);
      setUsers(usersRes.data.users);
      setTotalPages(usersRes.data.totalPages || 1);
      setPage(usersRes.data.page || p);
      const inputs = {};
      usersRes.data.users.forEach(u => { inputs[u.id] = u.Wallet?.overdraftLimit || 0; });
      setOverdraftInputs(prev => ({ ...inputs, ...prev }));
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []); // eslint-disable-line

  const fetchLogs = useCallback(async (p, action) => {
    setLogsLoading(true);
    try {
      const params = new URLSearchParams({ page: p, limit: 15 });
      if (action) params.append('action', action);
      const res = await api.get(`/api/admin/audit-logs?${params}`, config);
      setLogs(res.data.logs || []);
      setLogTotalPages(res.data.totalPages || 1);
      setLogPage(res.data.page || p);
    } catch {
      setLogs([]);
    } finally {
      setLogsLoading(false);
    }
  }, []); // eslint-disable-line

  useEffect(() => { fetchUsers(1, ''); }, []); // eslint-disable-line
  useEffect(() => {
    if (tab === 'auditlogs') fetchLogs(1, '');
  }, [tab]); // eslint-disable-line

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

  const toggleWalletStatus = async (userId, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
    setStatusUpdating(s => ({ ...s, [userId]: true }));
    try {
      await api.put(`/api/admin/users/${userId}/wallet-status`, { status: newStatus }, config);
      setUsers(prev => prev.map(u =>
        u.id === userId ? { ...u, Wallet: { ...u.Wallet, status: newStatus } } : u
      ));
    } catch {
      // ignore
    } finally {
      setStatusUpdating(s => ({ ...s, [userId]: false }));
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchUsers(1, search);
  };

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

      {/* Tab navigation */}
      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setTab('users')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${tab === 'users' ? 'border-[#075f47] text-[#075f47]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          <CreditCard size={16} /> Users & Wallets
        </button>
        <button
          onClick={() => setTab('auditlogs')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${tab === 'auditlogs' ? 'border-[#075f47] text-[#075f47]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          <ClipboardList size={16} /> Audit Logs
        </button>
      </div>

      {tab === 'users' && (
        <div className="card">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <h3 className="text-lg font-bold">Users & Overdraft Management</h3>
            <form onSubmit={handleSearch} className="flex gap-2 w-full md:w-auto">
              <div className="relative flex-1 md:w-64">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name, email..."
                  className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-[#075f47] focus:border-[#075f47]"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
              <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-[#075f47] rounded-lg hover:bg-[#064e3b]">Search</button>
            </form>
          </div>

          {loading ? (
            <div className="text-center py-8 text-gray-400">Loading users...</div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="text-xs font-bold text-gray-400 uppercase border-b border-gray-100">
                      <th className="pb-3 pr-4">User</th>
                      <th className="pb-3 pr-4">Role</th>
                      <th className="pb-3 pr-4">Balance</th>
                      <th className="pb-3 pr-4">Wallet Status</th>
                      <th className="pb-3 pr-4">Overdraft (₦)</th>
                      <th className="pb-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {users.map(u => (
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
                        <td className="py-3 pr-4 font-medium">{fmt(u.Wallet?.balance)}</td>
                        <td className="py-3 pr-4">
                          <span className={`text-xs font-bold px-2 py-1 rounded-full ${WALLET_STATUS_COLORS[u.Wallet?.status] || 'bg-gray-100 text-gray-500'}`}>
                            {u.Wallet?.status || 'unknown'}
                          </span>
                        </td>
                        <td className="py-3 pr-4">
                          <input
                            type="number" min="0"
                            className="w-24 px-2 py-1 border border-gray-200 rounded-lg text-sm focus:ring-[#075f47] focus:border-[#075f47]"
                            value={overdraftInputs[u.id] ?? 0}
                            onChange={e => setOverdraftInputs(prev => ({ ...prev, [u.id]: e.target.value }))}
                          />
                        </td>
                        <td className="py-3">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => saveOverdraft(u.id)}
                              disabled={saving[u.id]}
                              className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-white bg-[#075f47] rounded-lg hover:bg-[#064e3b] disabled:opacity-50"
                            >
                              {saveMsg[u.id] ? <><Check size={11} /> {saveMsg[u.id]}</> : saving[u.id] ? '...' : 'Set'}
                            </button>
                            <button
                              onClick={() => toggleWalletStatus(u.id, u.Wallet?.status)}
                              disabled={statusUpdating[u.id] || u.Wallet?.status === 'closed'}
                              className={`px-2 py-1 text-xs font-medium rounded-lg disabled:opacity-50 transition-colors ${
                                u.Wallet?.status === 'active'
                                  ? 'text-red-600 border border-red-200 hover:bg-red-50'
                                  : 'text-[#075f47] border border-green-200 hover:bg-green-50'
                              }`}
                            >
                              {statusUpdating[u.id] ? '...' : u.Wallet?.status === 'active' ? 'Suspend' : 'Activate'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {users.length === 0 && (
                      <tr><td colSpan={6} className="py-8 text-center text-gray-400">No users found.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                  <button
                    onClick={() => fetchUsers(page - 1, search)}
                    disabled={page <= 1}
                    className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg disabled:opacity-40"
                  >
                    <ChevronLeft size={16} /> Prev
                  </button>
                  <span className="text-sm text-gray-500">Page {page} of {totalPages}</span>
                  <button
                    onClick={() => fetchUsers(page + 1, search)}
                    disabled={page >= totalPages}
                    className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg disabled:opacity-40"
                  >
                    Next <ChevronRight size={16} />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {tab === 'auditlogs' && (
        <div className="card">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <h3 className="text-lg font-bold">Audit Logs</h3>
            <select
              value={logAction}
              onChange={e => { setLogAction(e.target.value); fetchLogs(1, e.target.value); }}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-[#075f47] focus:border-[#075f47]"
            >
              <option value="">All actions</option>
              <option value="REGISTER">REGISTER</option>
              <option value="LOGIN">LOGIN</option>
              <option value="TRANSFER">TRANSFER</option>
              <option value="TOP_UP">TOP_UP</option>
              <option value="VENDOR_PAYMENT">VENDOR_PAYMENT</option>
              <option value="PASSWORD_RESET">PASSWORD_RESET</option>
            </select>
          </div>

          {logsLoading ? (
            <div className="text-center py-8 text-gray-400">Loading audit logs...</div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="text-xs font-bold text-gray-400 uppercase border-b border-gray-100">
                      <th className="pb-3 pr-4">Timestamp</th>
                      <th className="pb-3 pr-4">User</th>
                      <th className="pb-3 pr-4">Action</th>
                      <th className="pb-3 pr-4">Entity</th>
                      <th className="pb-3">IP</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {logs.map(log => (
                      <tr key={log.id} className="hover:bg-gray-50">
                        <td className="py-3 pr-4 text-xs text-gray-500 whitespace-nowrap">
                          {new Date(log.createdAt).toLocaleString()}
                        </td>
                        <td className="py-3 pr-4">
                          {log.User ? (
                            <>
                              <p className="font-medium text-gray-900 text-xs">{log.User.firstName} {log.User.lastName}</p>
                              <p className="text-xs text-gray-400">{log.User.email}</p>
                            </>
                          ) : <span className="text-xs text-gray-400">—</span>}
                        </td>
                        <td className="py-3 pr-4">
                          <span className="text-xs font-bold px-2 py-1 rounded-full bg-gray-100 text-gray-700">{log.action}</span>
                        </td>
                        <td className="py-3 pr-4 text-xs text-gray-500">{log.entityType || '—'}</td>
                        <td className="py-3 text-xs text-gray-500">{log.ipAddress || '—'}</td>
                      </tr>
                    ))}
                    {logs.length === 0 && (
                      <tr><td colSpan={5} className="py-8 text-center text-gray-400">No audit logs found.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>

              {logTotalPages > 1 && (
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                  <button
                    onClick={() => fetchLogs(logPage - 1, logAction)}
                    disabled={logPage <= 1}
                    className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg disabled:opacity-40"
                  >
                    <ChevronLeft size={16} /> Prev
                  </button>
                  <span className="text-sm text-gray-500">Page {logPage} of {logTotalPages}</span>
                  <button
                    onClick={() => fetchLogs(logPage + 1, logAction)}
                    disabled={logPage >= logTotalPages}
                    className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg disabled:opacity-40"
                  >
                    Next <ChevronRight size={16} />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}

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
