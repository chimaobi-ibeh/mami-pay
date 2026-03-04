import React, { useState, useEffect } from 'react';
import { Wallet as WalletIcon, ArrowUpRight, ArrowDownLeft, Search, Filter, Download } from 'lucide-react';
import api from '../services/api';

const Wallet = ({ user }) => {
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [transferData, setTransferData] = useState({ receiverEmail: '', amount: '', description: '' });
  const [showTransfer, setShowTransfer] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      const [balanceRes, transRes] = await Promise.all([
        api.get('/api/wallet/balance', config),
        api.get('/api/wallet/transactions', config)
      ]);
      
      setBalance(balanceRes.data.balance);
      setTransactions(transRes.data);
    } catch (err) {
      console.error('Error fetching wallet data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleTransfer = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await api.post('/api/wallet/transfer', transferData, config);
      
      setSuccess('Transfer successful!');
      setTransferData({ receiverEmail: '', amount: '', description: '' });
      setShowTransfer(false);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.error || 'Transfer failed. Please try again.');
    }
  };

  if (loading) return <div className="flex items-center justify-center h-64">Loading wallet...</div>;

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">My Wallet</h1>
        <button 
          onClick={() => setShowTransfer(!showTransfer)}
          className="btn-primary flex items-center space-x-2"
        >
          <ArrowUpRight size={18} />
          <span>New Transfer</span>
        </button>
      </div>

      {showTransfer && (
        <div className="card max-w-2xl mx-auto border-2 border-[#075f47]/20">
          <h3 className="text-lg font-bold mb-4">Send Money</h3>
          <form onSubmit={handleTransfer} className="space-y-4">
            {error && <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg">{error}</div>}
            {success && <div className="p-3 bg-green-50 text-[#075f47] text-sm rounded-lg">{success}</div>}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Recipient Email</label>
                <input 
                  type="email" 
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-[#075f47] focus:border-[#075f47]"
                  placeholder="user@example.com"
                  value={transferData.receiverEmail}
                  onChange={(e) => setTransferData({...transferData, receiverEmail: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₦)</label>
                <input 
                  type="number" 
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-[#075f47] focus:border-[#075f47]"
                  placeholder="0.00"
                  value={transferData.amount}
                  onChange={(e) => setTransferData({...transferData, amount: e.target.value})}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <input 
                type="text" 
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-[#075f47] focus:border-[#075f47]"
                placeholder="What's this for?"
                value={transferData.description}
                onChange={(e) => setTransferData({...transferData, description: e.target.value})}
              />
            </div>
            <div className="flex justify-end space-x-3 pt-2">
              <button 
                type="button"
                onClick={() => setShowTransfer(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button type="submit" className="btn-primary">Confirm Transfer</button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card md:col-span-1 bg-[#075f47] text-white border-none">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-white/10 rounded-lg">
              <WalletIcon size={24} />
            </div>
          </div>
          <p className="text-green-100 text-sm mb-1">Available Balance</p>
          <h2 className="text-3xl font-bold">₦{parseFloat(balance).toLocaleString()}</h2>
          <div className="mt-6 pt-6 border-t border-white/10 flex justify-between items-center">
            <span className="text-xs text-green-200">Currency: NGN</span>
            <span className="text-xs font-medium bg-white/20 px-2 py-1 rounded">Active</span>
          </div>
        </div>

        <div className="card md:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold">Transaction History</h3>
            <div className="flex space-x-2">
              <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-all">
                <Search size={20} />
              </button>
              <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-all">
                <Filter size={20} />
              </button>
              <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-all">
                <Download size={20} />
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100">
                  <th className="pb-3 pl-2">Transaction</th>
                  <th className="pb-3">Date</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 text-right pr-2">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-gray-50 transition-colors group">
                    <td className="py-4 pl-2">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${tx.senderId === user.id ? 'bg-red-50 text-red-600' : 'bg-green-50 text-[#075f47]'}`}>
                          {tx.senderId === user.id ? <ArrowUpRight size={18} /> : <ArrowDownLeft size={18} />}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-900">{tx.description || tx.type}</p>
                          <p className="text-xs text-gray-500 font-medium">{tx.reference}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 text-sm text-gray-500">
                      {new Date(tx.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-4">
                      <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-full ${
                        tx.status === 'completed' ? 'bg-green-100 text-[#075f47]' : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {tx.status}
                      </span>
                    </td>
                    <td className={`py-4 text-right pr-2 font-bold ${tx.senderId === user.id ? 'text-red-600' : 'text-[#075f47]'}`}>
                      {tx.senderId === user.id ? '-' : '+'}₦{parseFloat(tx.amount).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {transactions.length === 0 && (
              <div className="py-12 text-center text-gray-400">
                No transactions found.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Wallet;
