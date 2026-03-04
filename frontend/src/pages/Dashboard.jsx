import React, { useState, useEffect } from 'react';
import { Wallet, ArrowUpRight, ArrowDownLeft, CreditCard, Clock } from 'lucide-react';
import api from '../services/api';

const Dashboard = ({ user }) => {
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const config = { headers: { Authorization: `Bearer ${token}` } };
        
        const [balanceRes, transRes] = await Promise.all([
          api.get('/api/wallet/balance', config),
          api.get('/api/wallet/transactions', config)
        ]);
        
        setBalance(balanceRes.data.balance);
        setTransactions(transRes.data.slice(0, 5));
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64">Loading dashboard...</div>;

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user.firstName}!</h1>
          <p className="text-gray-500">Here's what's happening with your account today.</p>
        </div>
        <div className="flex space-x-3">
          <button className="btn-primary flex items-center space-x-2">
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
          <h2 className="text-2xl font-bold text-gray-900">₦0.00</h2>
          <p className="mt-2 text-xs text-green-600 font-medium">+0% from last month</p>
        </div>

        <div className="card">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-red-50 text-red-600 rounded-lg">
              <ArrowUpRight size={24} />
            </div>
          </div>
          <p className="text-gray-500 text-sm mb-1">Monthly Expenses</p>
          <h2 className="text-2xl font-bold text-gray-900">₦0.00</h2>
          <p className="mt-2 text-xs text-red-600 font-medium">+0% from last month</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold text-gray-900">Recent Transactions</h3>
            <button className="text-[#075f47] text-sm font-medium hover:underline">View All</button>
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
            <button className="card flex flex-col items-center justify-center p-4 hover:border-[#075f47] transition-all group">
              <div className="p-3 bg-green-50 text-[#075f47] rounded-xl mb-2 group-hover:bg-[#075f47] group-hover:text-white transition-all">
                <ArrowUpRight size={24} />
              </div>
              <span className="text-sm font-medium">Transfer</span>
            </button>
            <button className="card flex flex-col items-center justify-center p-4 hover:border-[#075f47] transition-all group">
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
