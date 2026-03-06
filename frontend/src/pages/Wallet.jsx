import React, { useState, useEffect, useCallback } from 'react';
import {
  Wallet as WalletIcon, ArrowUpRight, ArrowDownLeft,
  Download, Plus, ChevronLeft, ChevronRight, X, Lock, Unlock, PiggyBank
} from 'lucide-react';
import api from '../services/api';

const fmt = (n) => `₦${parseFloat(n || 0).toLocaleString()}`;

const Wallet = ({ user }) => {
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');

  const [showTransfer, setShowTransfer] = useState(false);
  const [transferData, setTransferData] = useState({ receiverEmail: '', amount: '', description: '' });

  const [showTopUp, setShowTopUp] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState('');
  const [topUpLoading, setTopUpLoading] = useState(false);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [receipt, setReceipt] = useState(null);
  const [overdraftLimit, setOverdraftLimit] = useState(0);
  const [vaultBalance, setVaultBalance] = useState(0);
  const [vaultAmount, setVaultAmount] = useState('');
  const [showVault, setShowVault] = useState(false);
  const [vaultMode, setVaultMode] = useState('lock'); // 'lock' | 'unlock'
  const [vaultLoading, setVaultLoading] = useState(false);

  const token = localStorage.getItem('token');
  const config = { headers: { Authorization: `Bearer ${token}` } };

  const fetchData = useCallback(async (p = page) => {
    try {
      const [balanceRes, transRes, vaultRes] = await Promise.all([
        api.get('/api/wallet/balance', config),
        api.get(`/api/wallet/transactions?page=${p}&limit=20`, config),
        api.get('/api/savings/balance', config),
      ]);
      setBalance(balanceRes.data.balance);
      setOverdraftLimit(balanceRes.data.overdraftLimit || 0);
      setTransactions(transRes.data.transactions);
      setTotalPages(transRes.data.totalPages || 1);
      setVaultBalance(vaultRes.data.balance);
      setFetchError('');
    } catch {
      setFetchError('Failed to load wallet data. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  }, [page]); // eslint-disable-line

  useEffect(() => {
    fetchData(page);
  }, [page]); // eslint-disable-line

  const handleTransfer = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    try {
      await api.post('/api/wallet/transfer', transferData, config);
      setSuccess('Transfer successful!');
      setTransferData({ receiverEmail: '', amount: '', description: '' });
      setShowTransfer(false);
      fetchData(1); setPage(1);
    } catch (err) {
      setError(err.response?.data?.error || 'Transfer failed. Please try again.');
    }
  };

  const openPaystack = (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    const amount = parseFloat(topUpAmount);
    if (!amount || amount <= 0) { setError('Enter a valid amount.'); return; }

    const paystackKey = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY;
    if (!paystackKey || !window.PaystackPop) {
      // Fallback: direct top-up (no Paystack configured)
      setTopUpLoading(true);
      api.post('/api/wallet/topup', { amount: topUpAmount }, config)
        .then(() => { setSuccess('Wallet topped up successfully!'); setTopUpAmount(''); setShowTopUp(false); fetchData(1); setPage(1); })
        .catch((err) => setError(err.response?.data?.error || 'Top-up failed.'))
        .finally(() => setTopUpLoading(false));
      return;
    }

    const handler = window.PaystackPop.setup({
      key: paystackKey,
      email: user.email,
      amount: Math.round(amount * 100), // kobo
      currency: 'NGN',
      ref: `mami-${Date.now()}`,
      callback: async (response) => {
        // Payment successful — credit wallet
        setTopUpLoading(true);
        try {
          await api.post('/api/wallet/topup', { amount: topUpAmount, paystackRef: response.reference }, config);
          setSuccess('Payment successful! Wallet credited.');
          setTopUpAmount('');
          setShowTopUp(false);
          fetchData(1); setPage(1);
        } catch (err) {
          setError(err.response?.data?.error || 'Failed to credit wallet. Contact support with ref: ' + response.reference);
        } finally {
          setTopUpLoading(false);
        }
      },
      onClose: () => { setError('Payment cancelled.'); },
    });
    handler.openIframe();
  };

  const downloadCSV = () => {
    const headers = ['Reference', 'Type', 'Description', 'Amount', 'Direction', 'Status', 'Date'];
    const rows = transactions.map((tx) => [
      tx.reference,
      tx.type,
      tx.description || '',
      parseFloat(tx.amount).toFixed(2),
      tx.senderId === user.id ? 'Debit' : 'Credit',
      tx.status,
      new Date(tx.createdAt).toISOString(),
    ]);
    const csv = [headers, ...rows].map((r) => r.map((v) => `"${v}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mami-pay-transactions-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleVault = async (e) => {
    e.preventDefault();
    setVaultLoading(true);
    setError(''); setSuccess('');
    try {
      const endpoint = vaultMode === 'lock' ? '/api/savings/lock' : '/api/savings/unlock';
      const res = await api.post(endpoint, { amount: vaultAmount }, config);
      setSuccess(res.data.message);
      setBalance(res.data.walletBalance);
      setVaultBalance(res.data.vaultBalance);
      setVaultAmount('');
      setShowVault(false);
    } catch (err) {
      setError(err.response?.data?.error || 'Vault operation failed.');
    } finally {
      setVaultLoading(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center h-64">Loading wallet...</div>;
  if (fetchError) return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <p className="text-red-600 font-medium">{fetchError}</p>
        <button onClick={() => fetchData(page)} className="mt-4 btn-primary">Retry</button>
      </div>
    </div>
  );

  return (
    <div className="space-y-8">

      {/* Vault Modal */}
      {showVault && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <div className="flex items-center gap-2 mb-4">
              {vaultMode === 'lock' ? <Lock size={20} className="text-[#075f47]" /> : <Unlock size={20} className="text-[#075f47]" />}
              <h3 className="text-lg font-bold text-gray-900">
                {vaultMode === 'lock' ? 'Lock Funds into Vault' : 'Unlock Funds from Vault'}
              </h3>
            </div>
            <p className="text-sm text-gray-500 mb-4">
              {vaultMode === 'lock'
                ? `Wallet balance: ${fmt(balance)}`
                : `Vault balance: ${fmt(vaultBalance)}`}
            </p>
            <form onSubmit={handleVault} className="space-y-4">
              {error && <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg">{error}</div>}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₦)</label>
                <input
                  type="number" required min="1"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-[#075f47] focus:border-[#075f47]"
                  placeholder="0.00"
                  value={vaultAmount}
                  onChange={(e) => setVaultAmount(e.target.value)}
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowVault(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
                <button type="submit" disabled={vaultLoading} className="btn-primary disabled:opacity-50">
                  {vaultLoading ? 'Processing...' : vaultMode === 'lock' ? 'Lock Funds' : 'Unlock Funds'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Receipt Modal */}
      {receipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 relative">
            <button onClick={() => setReceipt(null)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
              <X size={20} />
            </button>
            <h3 className="text-lg font-bold mb-4 text-gray-900">Transaction Receipt</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Reference</span>
                <span className="font-mono font-medium text-gray-900">{receipt.reference}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Type</span>
                <span className="capitalize text-gray-900">{receipt.type.replace('_', ' ')}</span>
              </div>
              {receipt.description && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Description</span>
                  <span className="text-gray-900 text-right max-w-[60%]">{receipt.description}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-500">Amount</span>
                <span className={`font-bold text-base ${receipt.senderId === user.id ? 'text-red-600' : 'text-[#075f47]'}`}>
                  {receipt.senderId === user.id ? '-' : '+'}{fmt(receipt.amount)}
                </span>
              </div>
              {receipt.sender && (
                <div className="flex justify-between">
                  <span className="text-gray-500">From</span>
                  <span className="text-gray-900">{receipt.sender.firstName} {receipt.sender.lastName}</span>
                </div>
              )}
              {receipt.receiver && receipt.type === 'transfer' && (
                <div className="flex justify-between">
                  <span className="text-gray-500">To</span>
                  <span className="text-gray-900">{receipt.receiver.firstName} {receipt.receiver.lastName}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-500">Status</span>
                <span className={`font-bold uppercase text-xs px-2 py-1 rounded-full ${receipt.status === 'completed' ? 'bg-green-100 text-[#075f47]' : 'bg-yellow-100 text-yellow-700'}`}>
                  {receipt.status}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Date</span>
                <span className="text-gray-900">{new Date(receipt.createdAt).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">My Wallet</h1>
        <div className="flex space-x-3">
          <button
            onClick={() => { setShowTopUp(!showTopUp); setShowTransfer(false); setError(''); setSuccess(''); }}
            className="flex items-center space-x-2 px-4 py-2 border border-[#075f47] text-[#075f47] rounded-lg hover:bg-green-50 transition-colors font-medium text-sm"
          >
            <Plus size={18} />
            <span>Top Up</span>
          </button>
          <button
            onClick={() => { setShowTransfer(!showTransfer); setShowTopUp(false); setError(''); setSuccess(''); }}
            className="btn-primary flex items-center space-x-2"
          >
            <ArrowUpRight size={18} />
            <span>New Transfer</span>
          </button>
        </div>
      </div>

      {success && !showTransfer && !showTopUp && (
        <div className="p-3 bg-green-50 text-[#075f47] text-sm rounded-lg border border-green-200">{success}</div>
      )}

      {showTopUp && (
        <div className="card max-w-sm border-2 border-[#075f47]/20">
          <h3 className="text-lg font-bold mb-1">Fund Wallet</h3>
          {import.meta.env.VITE_PAYSTACK_PUBLIC_KEY && (
            <p className="text-xs text-gray-400 mb-4">Secured by Paystack</p>
          )}
          <form onSubmit={openPaystack} className="space-y-4">
            {error && <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg">{error}</div>}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₦)</label>
              <input
                type="number" required min="100" step="50"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-[#075f47] focus:border-[#075f47]"
                placeholder="0.00"
                value={topUpAmount}
                onChange={(e) => setTopUpAmount(e.target.value)}
              />
            </div>
            <div className="flex justify-end space-x-3 pt-2">
              <button type="button" onClick={() => setShowTopUp(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">Cancel</button>
              <button type="submit" disabled={topUpLoading} className="btn-primary disabled:opacity-50">
                {topUpLoading ? 'Processing...' : import.meta.env.VITE_PAYSTACK_PUBLIC_KEY ? 'Pay with Paystack' : 'Top Up'}
              </button>
            </div>
          </form>
        </div>
      )}

      {showTransfer && (
        <div className="card max-w-2xl mx-auto border-2 border-[#075f47]/20">
          <h3 className="text-lg font-bold mb-4">Send Money</h3>
          <form onSubmit={handleTransfer} className="space-y-4">
            {error && <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg">{error}</div>}
            {success && <div className="p-3 bg-green-50 text-[#075f47] text-sm rounded-lg">{success}</div>}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Recipient Email</label>
                <input type="email" required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-[#075f47] focus:border-[#075f47]"
                  placeholder="user@example.com"
                  value={transferData.receiverEmail}
                  onChange={(e) => setTransferData({ ...transferData, receiverEmail: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₦)</label>
                <input type="number" required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-[#075f47] focus:border-[#075f47]"
                  placeholder="0.00"
                  value={transferData.amount}
                  onChange={(e) => setTransferData({ ...transferData, amount: e.target.value })}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <input type="text"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-[#075f47] focus:border-[#075f47]"
                placeholder="What's this for?"
                value={transferData.description}
                onChange={(e) => setTransferData({ ...transferData, description: e.target.value })}
              />
            </div>
            <div className="flex justify-end space-x-3 pt-2">
              <button type="button" onClick={() => setShowTransfer(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">Cancel</button>
              <button type="submit" className="btn-primary">Confirm Transfer</button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-4 md:col-span-1">
          <div className="card bg-[#075f47] text-white border-none">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-white/10 rounded-lg"><WalletIcon size={24} /></div>
            </div>
            <p className="text-green-100 text-sm mb-1">Available Balance</p>
            <h2 className="text-3xl font-bold">{fmt(balance)}</h2>
            {parseFloat(overdraftLimit) > 0 && (
              <div className="mt-3 flex items-center gap-2 text-xs text-green-200">
                <span className="bg-white/10 px-2 py-1 rounded">Overdraft: {fmt(overdraftLimit)}</span>
                <span className="text-green-300">Total available: {fmt(parseFloat(balance) + parseFloat(overdraftLimit))}</span>
              </div>
            )}
            <div className="mt-4 pt-4 border-t border-white/10 flex justify-between items-center">
              <span className="text-xs text-green-200">Currency: NGN</span>
              <span className="text-xs font-medium bg-white/20 px-2 py-1 rounded">Active</span>
            </div>
          </div>

          {/* Savings Vault Card */}
          <div className="card border-2 border-dashed border-[#075f47]/30">
            <div className="flex justify-between items-start mb-3">
              <div className="p-2 bg-green-50 text-[#075f47] rounded-lg"><PiggyBank size={20} /></div>
              <span className="text-xs font-bold text-[#075f47] bg-green-50 px-2 py-1 rounded-full">VAULT</span>
            </div>
            <p className="text-gray-500 text-xs mb-1">Savings Vault</p>
            <h3 className="text-2xl font-bold text-gray-900">{fmt(vaultBalance)}</h3>
            <p className="text-xs text-gray-400 mt-1 mb-4">Locked savings — tap to manage</p>
            <div className="flex gap-2">
              <button
                onClick={() => { setVaultMode('lock'); setShowVault(true); setError(''); setSuccess(''); }}
                className="flex-1 flex items-center justify-center gap-1 py-2 text-xs font-medium text-white bg-[#075f47] rounded-lg hover:bg-[#064e3b] transition-colors"
              >
                <Lock size={12} /> Lock
              </button>
              <button
                onClick={() => { setVaultMode('unlock'); setShowVault(true); setError(''); setSuccess(''); }}
                className="flex-1 flex items-center justify-center gap-1 py-2 text-xs font-medium text-[#075f47] border border-[#075f47] rounded-lg hover:bg-green-50 transition-colors"
              >
                <Unlock size={12} /> Unlock
              </button>
            </div>
          </div>
        </div>

        <div className="card md:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold">Transaction History</h3>
            <button
              onClick={downloadCSV}
              title="Download CSV"
              className="p-2 text-gray-400 hover:text-[#075f47] hover:bg-green-50 rounded-lg transition-all"
            >
              <Download size={20} />
            </button>
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
                  <tr
                    key={tx.id}
                    onClick={() => setReceipt(tx)}
                    className="hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    <td className="py-4 pl-2">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${tx.senderId === user.id ? 'bg-red-50 text-red-600' : 'bg-green-50 text-[#075f47]'}`}>
                          {tx.senderId === user.id ? <ArrowUpRight size={18} /> : <ArrowDownLeft size={18} />}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-900">{tx.description || tx.type.replace('_', ' ')}</p>
                          <p className="text-xs text-gray-500 font-medium">{tx.reference}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 text-sm text-gray-500">{new Date(tx.createdAt).toLocaleDateString()}</td>
                    <td className="py-4">
                      <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-full ${tx.status === 'completed' ? 'bg-green-100 text-[#075f47]' : 'bg-yellow-100 text-yellow-700'}`}>
                        {tx.status}
                      </span>
                    </td>
                    <td className={`py-4 text-right pr-2 font-bold ${tx.senderId === user.id ? 'text-red-600' : 'text-[#075f47]'}`}>
                      {tx.senderId === user.id ? '-' : '+'}{fmt(tx.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {transactions.length === 0 && (
              <div className="py-12 text-center text-gray-400">No transactions found.</div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="flex items-center space-x-1 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={16} /> <span>Prev</span>
              </button>
              <span className="text-sm text-gray-500">Page {page} of {totalPages}</span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="flex items-center space-x-1 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <span>Next</span> <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Wallet;
