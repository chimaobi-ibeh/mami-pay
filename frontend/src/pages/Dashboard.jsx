import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wallet, ArrowUpRight, ArrowDownLeft, CreditCard, Clock, TrendingDown, BadgeCheck } from 'lucide-react';
import api from '../services/api';

const fmt = (n) => `₦${parseFloat(n || 0).toLocaleString()}`;

const Dashboard = ({ user }) => {
  const navigate = useNavigate();
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [allowee, setAllowee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const config = { headers: { Authorization: `Bearer ${token}` } };

        const [balanceRes, transRes, alloweeRes] = await Promise.all([
          api.get('/api/wallet/balance', config),
          api.get('/api/wallet/transactions', config),
          api.get('/api/wallet/allowee-summary', config)
        ]);

        setBalance(balanceRes.data.balance);
        setTransactions((transRes.data.transactions || []).slice(0, 5));
        setAllowee(alloweeRes.data);
      } catch (err) {
        setError('Failed to load dashboard data. Please refresh the page.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64">Loading dashboard...</div>;
  if (error) return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <p className="text-red-600 font-medium">{error}</p>
        <button onClick={() => window.location.reload()} className="mt-4 btn-primary">Retry</button>
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user.firstName}!</h1>
          <p className="text-gray-500">Here's what's happening with your account today.</p>
        </div>
        <div className="flex space-x-3">
          <button onClick={() => navigate('/wallet')} className="btn-primary flex items-center space-x-2">
            <ArrowUpRight size={18} />
            <span>Send Money</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card bg-[#075f47] text-white border-none">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-white/10 rounded-lg">
              <Wallet size={24} />
            </div>
            <span className="text-xs font-medium bg-white/20 px-2 py-1 rounded">Active</span>
          </div>
          <p className="text-green-100 text-sm mb-1">Total Balance</p>
          <h2 className="text-3xl font-bold">₦{parseFloat(balance).toLocaleString()}</h2>
          <div className="mt-6 flex items-center text-xs text-green-200">
            <CreditCard size={14} className="mr-1" />
            <span>Mami Pay Virtual Card</span>
          </div>
        </div>

        <div className="card">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-green-50 text-[#075f47] rounded-lg">
              <ArrowDownLeft size={24} />
            </div>
          </div>
          <p className="text-gray-500 text-sm mb-1">Monthly Income</p>
          <h2 className="text-2xl font-bold text-gray-900">{allowee ? fmt(allowee.received) : '₦0.00'}</h2>
          <p className="mt-2 text-xs text-green-600 font-medium">{allowee?.month || 'This month'}</p>
        </div>

        <div className="card">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-red-50 text-red-600 rounded-lg">
              <ArrowUpRight size={24} />
            </div>
          </div>
          <p className="text-gray-500 text-sm mb-1">Monthly Expenses</p>
          <h2 className="text-2xl font-bold text-gray-900">{allowee ? fmt(allowee.spent) : '₦0.00'}</h2>
          <p className="mt-2 text-xs text-red-600 font-medium">{allowee?.month || 'This month'}</p>
        </div>
      </div>

      {/* Allowee Tracker */}
      {allowee && user.role === 'corper' && (
        <div className="card border-l-4 border-[#075f47]">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <BadgeCheck size={20} className="text-[#075f47]" />
              <h3 className="font-bold text-gray-900">Allowee Tracker — {allowee.month}</h3>
            </div>
            <span className={`text-xs font-bold px-2 py-1 rounded-full ${allowee.received >= allowee.expected ? 'bg-green-100 text-[#075f47]' : 'bg-yellow-100 text-yellow-700'}`}>
              {allowee.received >= allowee.expected ? 'Received' : 'Pending'}
            </span>
          </div>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div>
              <p className="text-xs text-gray-500 mb-1">Expected Allowee</p>
              <p className="text-lg font-bold text-gray-900">{fmt(allowee.expected)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Received This Month</p>
              <p className="text-lg font-bold text-[#075f47]">{fmt(allowee.received)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Spent This Month</p>
              <p className="text-lg font-bold text-red-600">{fmt(allowee.spent)}</p>
            </div>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2">
            <div
              className="bg-[#075f47] h-2 rounded-full transition-all"
              style={{ width: `${Math.min(100, (allowee.received / allowee.expected) * 100)}%` }}
            />
          </div>
          <p className="text-xs text-gray-400 mt-1">
            {allowee.received >= allowee.expected
              ? 'Full allowee received'
              : `${fmt(allowee.expected - allowee.received)} remaining`}
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold text-gray-900">Recent Transactions</h3>
            <button onClick={() => navigate('/wallet')} className="text-[#075f47] text-sm font-medium hover:underline">View All</button>
          </div>
          <div className="card p-0 overflow-hidden">
            {transactions.length > 0 ? (
              <div className="divide-y divide-gray-100">
                {transactions.map((tx) => (
                  <div key={tx.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className={`p-2 rounded-full ${tx.senderId === user.id ? 'bg-red-50 text-red-600' : 'bg-green-50 text-[#075f47]'}`}>
                        {tx.senderId === user.id ? <ArrowUpRight size={20} /> : <ArrowDownLeft size={20} />}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{tx.description || tx.type}</p>
                        <p className="text-xs text-gray-500">{new Date(tx.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold ${tx.senderId === user.id ? 'text-red-600' : 'text-[#075f47]'}`}>
                        {tx.senderId === user.id ? '-' : '+'}₦{parseFloat(tx.amount).toLocaleString()}
                      </p>
                      <p className="text-[10px] uppercase tracking-wider text-gray-400 font-medium">{tx.status}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-gray-500">
                <Clock size={48} className="mx-auto mb-4 opacity-20" />
                <p>No transactions yet.</p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <h3 className="text-lg font-bold text-gray-900">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-4">
            <button onClick={() => navigate('/wallet')} className="card flex flex-col items-center justify-center p-4 hover:border-[#075f47] transition-all group">
              <div className="p-3 bg-green-50 text-[#075f47] rounded-xl mb-2 group-hover:bg-[#075f47] group-hover:text-white transition-all">
                <ArrowUpRight size={24} />
              </div>
              <span className="text-sm font-medium">Transfer</span>
            </button>
            <button onClick={() => navigate('/wallet')} className="card flex flex-col items-center justify-center p-4 hover:border-[#075f47] transition-all group">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-xl mb-2 group-hover:bg-blue-600 group-hover:text-white transition-all">
                <CreditCard size={24} />
              </div>
              <span className="text-sm font-medium">Pay Bills</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
