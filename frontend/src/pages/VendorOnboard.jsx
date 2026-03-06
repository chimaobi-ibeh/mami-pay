import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Store, ArrowRight, Check } from 'lucide-react';
import api from '../services/api';

const SHOP_CATEGORIES = [
  'Food & Drinks', 'Groceries', 'Clothing', 'Electronics',
  'Pharmacy', 'Salon & Beauty', 'Laundry', 'Printing & Stationery', 'Other',
];

const VendorOnboard = ({ user }) => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ shopName: '', shopCategory: '', shopDescription: '' });
  const [loading, setLoading] = useState(false);
  const [prefilling, setPrefilling] = useState(true);
  const [error, setError] = useState('');

  const token = localStorage.getItem('token');

  useEffect(() => {
    api.get('/api/vendor/profile', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => {
        const v = res.data.vendor;
        if (v?.shopName) {
          setForm({
            shopName: v.shopName || '',
            shopCategory: v.shopCategory || '',
            shopDescription: v.shopDescription || '',
          });
        }
      })
      .catch(() => {})
      .finally(() => setPrefilling(false));
  }, []); // eslint-disable-line

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.shopName.trim()) { setError('Store name is required.'); return; }
    setLoading(true); setError('');
    try {
      await api.put('/api/vendor/profile', form, {
        headers: { Authorization: `Bearer ${token}` },
      });
      navigate('/vendor');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save store profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (prefilling) return <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-400">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[#075f47] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Store size={32} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">{form.shopName ? 'Edit Your Store' : 'Set Up Your Store'}</h1>
          <p className="text-gray-500 mt-2">
            Tell corps members what you sell so they can find and pay you easily.
          </p>
        </div>

        {/* Form card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-200">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Store Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Mama Ngozi's Kitchen"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#075f47]/20 focus:border-[#075f47] outline-none transition"
                value={form.shopName}
                onChange={e => setForm({ ...form, shopName: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Category</label>
              <select
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#075f47]/20 focus:border-[#075f47] outline-none transition bg-white"
                value={form.shopCategory}
                onChange={e => setForm({ ...form, shopCategory: e.target.value })}
              >
                <option value="">Select a category</option>
                {SHOP_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Description <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <textarea
                rows={3}
                placeholder="Briefly describe what you sell, your hours, or anything useful for corps members..."
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#075f47]/20 focus:border-[#075f47] outline-none transition resize-none"
                value={form.shopDescription}
                onChange={e => setForm({ ...form, shopDescription: e.target.value })}
              />
              <p className="text-xs text-gray-400 mt-1">{form.shopDescription.length}/300 characters</p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-[#075f47] text-white py-3 px-6 rounded-xl font-semibold hover:bg-[#064e3b] transition-colors disabled:opacity-50 mt-2"
            >
              {loading ? 'Saving...' : (
                <>
                  {form.shopName ? 'Save Changes' : 'Complete Setup'} <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Benefits list */}
        <div className="mt-6 grid grid-cols-3 gap-3 text-center">
          {[
            { icon: '⚡', text: 'Instant payments' },
            { icon: '📲', text: 'QR code generated' },
            { icon: '📊', text: 'Sales tracking' },
          ].map(({ icon, text }) => (
            <div key={text} className="bg-white border border-gray-100 rounded-xl p-3 shadow-sm">
              <div className="text-2xl mb-1">{icon}</div>
              <p className="text-xs text-gray-500 font-medium">{text}</p>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};

export default VendorOnboard;
