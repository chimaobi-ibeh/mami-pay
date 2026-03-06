import React, { useState, useEffect } from 'react';
import { TrendingUp, ArrowUpRight, BarChart2 } from 'lucide-react';
import api from '../services/api';

const fmt = (n) => `₦${parseFloat(n || 0).toLocaleString()}`;

const CAT_COLORS = {
  'Food & Shopping': 'bg-orange-400',
  'Transfer':        'bg-blue-400',
  'Top-up':          'bg-green-500',
  'Overdraft':       'bg-red-500',
  'Other':           'bg-gray-400',
};

const Analytics = ({ user }) => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const config = { headers: { Authorization: `Bearer ${token}` } };
    api.get('/api/wallet/transactions?limit=200', config)
      .then(r => setTransactions(r.data.transactions || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const sent = transactions.filter(tx => tx.senderId === user.id && tx.type !== 'top_up');
  const received = transactions.filter(tx => tx.receiverId === user.id || tx.type === 'top_up');

  const totalSpent = sent.reduce((s, tx) => s + parseFloat(tx.amount), 0);
  const totalReceived = received.reduce((s, tx) => s + parseFloat(tx.amount), 0);

  // Spending by category
  const byCategory = {};
  sent.forEach(tx => {
    const cat = tx.category ||
      (tx.type === 'vendor_payment' ? 'Food & Shopping' : tx.type === 'transfer' ? 'Transfer' : 'Other');
    byCategory[cat] = (byCategory[cat] || 0) + parseFloat(tx.amount);
  });
  const categories = Object.entries(byCategory).sort((a, b) => b[1] - a[1]);

  // Monthly bar data (last 6 months)
  const monthlyMap = {};
  transactions.forEach(tx => {
    const key = new Date(tx.createdAt).toLocaleString('default', { month: 'short', year: '2-digit' });
    if (!monthlyMap[key]) monthlyMap[key] = { spent: 0, received: 0 };
    if (tx.senderId === user.id && tx.type !== 'top_up') {
      monthlyMap[key].spent += parseFloat(tx.amount);
    } else {
      monthlyMap[key].received += parseFloat(tx.amount);
    }
  });
  const months = Object.entries(monthlyMap).slice(-6);
  const maxVal = Math.max(...months.map(([, d]) => Math.max(d.spent, d.received)), 1);

  if (loading) return (
    <div className="flex items-center justify-center h-64 text-gray-400">Loading analytics...</div>
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Spending Analytics</h1>
        <p className="text-gray-500">Understand where your money goes.</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[#075f47] text-white p-6 rounded-xl shadow-sm">
          <div className="p-2 bg-white/10 rounded-lg w-fit mb-4"><TrendingUp size={24} /></div>
          <p className="text-green-100 text-sm mb-1">Total Received</p>
          <h2 className="text-3xl font-bold">{fmt(totalReceived)}</h2>
          <p className="text-xs text-green-200 mt-2">All time</p>
        </div>
        <div className="card">
          <div className="p-2 bg-red-50 text-red-600 rounded-lg w-fit mb-4"><ArrowUpRight size={24} /></div>
          <p className="text-gray-500 text-sm mb-1">Total Spent</p>
          <h2 className="text-3xl font-bold text-gray-900">{fmt(totalSpent)}</h2>
          <p className="text-xs text-red-600 mt-2">All time</p>
        </div>
      </div>

      {/* Spending by category */}
      {categories.length > 0 && (
        <div className="card">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Spending by Category</h3>
          <div className="space-y-5">
            {categories.map(([cat, amount]) => (
              <div key={cat}>
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-sm font-medium text-gray-700">{cat}</span>
                  <span className="text-sm font-bold text-gray-900">{fmt(amount)}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2.5">
                  <div
                    className={`${CAT_COLORS[cat] || 'bg-gray-400'} h-2.5 rounded-full transition-all duration-500`}
                    style={{ width: `${totalSpent > 0 ? (amount / totalSpent) * 100 : 0}%` }}
                  />
                </div>
                <p className="text-xs text-gray-400 mt-0.5">
                  {totalSpent > 0 ? ((amount / totalSpent) * 100).toFixed(1) : 0}% of spending
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Monthly bar chart */}
      {months.length > 0 && (
        <div className="card">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Monthly Overview</h3>
          <div className="flex items-end gap-2" style={{ height: '160px' }}>
            {months.map(([month, data]) => (
              <div key={month} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                <div className="w-full flex gap-0.5 items-end" style={{ height: '130px' }}>
                  <div
                    className="flex-1 bg-[#075f47] rounded-t-sm transition-all duration-500"
                    style={{ height: `${(data.received / maxVal) * 130}px`, minHeight: data.received ? 3 : 0 }}
                    title={`Received: ${fmt(data.received)}`}
                  />
                  <div
                    className="flex-1 bg-red-400 rounded-t-sm transition-all duration-500"
                    style={{ height: `${(data.spent / maxVal) * 130}px`, minHeight: data.spent ? 3 : 0 }}
                    title={`Spent: ${fmt(data.spent)}`}
                  />
                </div>
                <span className="text-[10px] text-gray-400 mt-1">{month}</span>
              </div>
            ))}
          </div>
          <div className="flex gap-4 mt-4 pt-4 border-t border-gray-100">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-[#075f47] rounded-sm" />
              <span className="text-xs text-gray-500">Received</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-400 rounded-sm" />
              <span className="text-xs text-gray-500">Spent</span>
            </div>
          </div>
        </div>
      )}

      {transactions.length === 0 && (
        <div className="card text-center py-16">
          <BarChart2 size={48} className="mx-auto mb-4 text-gray-200" />
          <p className="text-gray-500">No transactions yet. Start transacting to see your analytics.</p>
        </div>
      )}
    </div>
  );
};

export default Analytics;
