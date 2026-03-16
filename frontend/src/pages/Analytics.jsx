import React, { useState, useEffect } from 'react';
import { TrendingUp, ArrowUpRight, BarChart2 } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import api from '../services/api';

const fmt = (n) => `₦${parseFloat(n || 0).toLocaleString()}`;

const COLORS = ['#075f47', '#3b82f6', '#f97316', '#ef4444', '#8b5cf6', '#ec4899', '#6b7280'];

const Analytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    api.get('/api/wallet/analytics', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => setData(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64 text-gray-400">Loading analytics...</div>
  );

  const { totalSpent = 0, totalReceived = 0, spendingByCategory = [], monthlyData = [] } = data || {};

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
          <p className="text-xs text-green-200 mt-2">Last 6 months</p>
        </div>
        <div className="card">
          <div className="p-2 bg-red-50 text-red-600 rounded-lg w-fit mb-4"><ArrowUpRight size={24} /></div>
          <p className="text-gray-500 text-sm mb-1">Total Spent</p>
          <h2 className="text-3xl font-bold text-gray-900">{fmt(totalSpent)}</h2>
          <p className="text-xs text-red-600 mt-2">Last 6 months</p>
        </div>
      </div>

      {/* Monthly bar chart */}
      {monthlyData.length > 0 && (
        <div className="card">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Monthly Overview</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={monthlyData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tickFormatter={(v) => `₦${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v) => fmt(v)} />
              <Legend />
              <Bar dataKey="received" name="Received" fill="#075f47" radius={[4, 4, 0, 0]} />
              <Bar dataKey="spent" name="Spent" fill="#f87171" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Spending by category pie chart */}
      {spendingByCategory.length > 0 && (
        <div className="card">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Spending by Category</h3>
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="w-full md:w-1/2">
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie
                    data={spendingByCategory}
                    dataKey="amount"
                    nameKey="category"
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    label={({ category, percent }) => `${category} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {spendingByCategory.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => fmt(v)} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-col gap-2 min-w-[160px]">
              {spendingByCategory.map((cat, i) => (
                <div key={cat.category} className="flex items-center gap-2 text-sm">
                  <div className="w-3 h-3 rounded-sm flex-shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                  <span className="text-gray-700 flex-1">{cat.category}</span>
                  <span className="font-bold text-gray-900">{fmt(cat.amount)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {!spendingByCategory.length && !monthlyData.length && (
        <div className="card text-center py-16">
          <BarChart2 size={48} className="mx-auto mb-4 text-gray-200" />
          <p className="text-gray-500">No transactions yet. Start transacting to see your analytics.</p>
        </div>
      )}
    </div>
  );
};

export default Analytics;
