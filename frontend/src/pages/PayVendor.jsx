import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Store, CheckCircle, ArrowLeft } from 'lucide-react';
import api from '../services/api';

const PayVendor = ({ user }) => {
  const { vendorId } = useParams();
  const navigate = useNavigate();
  const [vendor, setVendor] = useState(null);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const token = localStorage.getItem('token');
  const config = { headers: { Authorization: `Bearer ${token}` } };

  useEffect(() => {
    api.get(`/api/vendor/info/${vendorId}`)
      .then(r => setVendor(r.data.vendor))
      .catch(() => setError('Vendor not found or link is invalid.'))
      .finally(() => setLoading(false));
  }, [vendorId]);

  const handlePay = async (e) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) { setError('Enter a valid amount.'); return; }
    setPaying(true);
    setError('');
    try {
      await api.post('/api/vendor/pay', { vendorId, amount: parseFloat(amount), description }, config);
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Payment failed. Please try again.');
    } finally {
      setPaying(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64 text-gray-400">Loading vendor info...</div>
  );

  if (error && !vendor) return (
    <div className="max-w-sm mx-auto text-center py-16">
      <p className="text-red-600 font-medium mb-4">{error}</p>
      <button onClick={() => navigate('/dashboard')} className="btn-primary">Go to Dashboard</button>
    </div>
  );

  if (success) return (
    <div className="max-w-sm mx-auto text-center py-16">
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <CheckCircle size={36} className="text-[#075f47]" />
      </div>
      <h2 className="text-xl font-bold text-gray-900 mb-2">Payment Successful!</h2>
      <p className="text-gray-500 mb-1">
        ₦{parseFloat(amount).toLocaleString()} paid to{' '}
        <span className="font-semibold">{vendor?.shopName || `${vendor?.firstName}'s store`}</span>
      </p>
      <p className="text-xs text-gray-400 mb-8">The vendor's wallet has been credited instantly.</p>
      <button onClick={() => navigate('/dashboard')} className="btn-primary">Back to Dashboard</button>
    </div>
  );

  return (
    <div className="max-w-sm mx-auto">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-[#075f47] mb-6 transition-colors"
      >
        <ArrowLeft size={16} /> Back
      </button>

      {/* Vendor card */}
      <div className="card text-center mb-6">
        <div className="w-14 h-14 bg-[#075f47] rounded-2xl flex items-center justify-center mx-auto mb-3">
          <Store size={28} className="text-white" />
        </div>
        <h2 className="text-xl font-bold text-gray-900">
          {vendor?.shopName || `${vendor?.firstName}'s Store`}
        </h2>
        {vendor?.shopCategory && (
          <span className="inline-block mt-1 text-xs font-medium bg-green-50 text-[#075f47] px-3 py-1 rounded-full">
            {vendor.shopCategory}
          </span>
        )}
        <p className="text-xs text-gray-400 mt-2">
          Powered by Mami Pay · {vendor?.firstName} {vendor?.lastName}
        </p>
      </div>

      {/* Payment form */}
      <div className="card">
        <h3 className="font-bold text-gray-900 mb-4">Enter Payment Amount</h3>
        {error && (
          <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg mb-4">{error}</div>
        )}
        <form onSubmit={handlePay} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₦)</label>
            <input
              type="number"
              min="1"
              step="0.01"
              required
              autoFocus
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-2xl font-bold text-center focus:ring-[#075f47] focus:border-[#075f47]"
              placeholder="0.00"
              value={amount}
              onChange={e => setAmount(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <input
              type="text"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-[#075f47] focus:border-[#075f47]"
              placeholder="e.g. Jollof rice + drink"
              value={description}
              onChange={e => setDescription(e.target.value)}
            />
          </div>
          <button
            type="submit"
            disabled={paying || !amount}
            className="w-full btn-primary py-3 text-base font-semibold disabled:opacity-50"
          >
            {paying ? 'Processing...' : `Pay ₦${amount ? parseFloat(amount).toLocaleString() : '0'}`}
          </button>
        </form>
      </div>
    </div>
  );
};

export default PayVendor;
