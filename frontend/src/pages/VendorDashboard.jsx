import React, { useState, useEffect } from 'react';
import { Store, TrendingUp, Users, QrCode, Download, ArrowDownLeft, RefreshCw, Pencil, Check } from 'lucide-react';
import api from '../services/api';

const fmt = (n) => `₦${parseFloat(n || 0).toLocaleString()}`;

const SHOP_CATEGORIES = ['Food & Drinks', 'Groceries', 'Clothing', 'Electronics', 'Pharmacy', 'Salon & Beauty', 'Laundry', 'Printing & Stationery', 'Other'];

const VendorDashboard = ({ user }) => {
  const [qr, setQr] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showQR, setShowQR] = useState(false);
  const [onboarding, setOnboarding] = useState({ shopName: '', shopCategory: '' });
  const [onboardingLoading, setOnboardingLoading] = useState(false);
  const [onboardingError, setOnboardingError] = useState('');
  const [editingShop, setEditingShop] = useState(false);

  const token = localStorage.getItem('token');
  const config = { headers: { Authorization: `Bearer ${token}` } };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/api/vendor/profile', config);
        setProfile(res.data);
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []); // eslint-disable-line

  const loadQR = async () => {
    if (qr) { setShowQR(true); return; }
    try {
      const res = await api.get('/api/vendor/qr', config);
      setQr(res.data.qr);
      setShowQR(true);
    } catch {
      // ignore
    }
  };

  const downloadQR = () => {
    if (!qr) return;
    const a = document.createElement('a');
    a.href = qr;
    a.download = `mami-pay-qr-${user.firstName}.png`;
    a.click();
  };

  const saveShopProfile = async (e) => {
    e.preventDefault();
    if (!onboarding.shopName.trim()) { setOnboardingError('Shop name is required.'); return; }
    setOnboardingLoading(true);
    setOnboardingError('');
    try {
      await api.put('/api/vendor/profile', onboarding, config);
      setProfile(prev => ({ ...prev, vendor: { ...prev?.vendor, ...onboarding } }));
      setEditingShop(false);
    } catch (err) {
      setOnboardingError(err.response?.data?.error || 'Failed to save store profile.');
    } finally {
      setOnboardingLoading(false);
    }
  };

  const shopName = profile?.vendor?.shopName;

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Vendor Dashboard</h1>
          <p className="text-gray-500">Manage your store and track sales.</p>
        </div>
        <button
          onClick={loadQR}
          className="btn-primary flex items-center space-x-2"
        >
          <QrCode size={18} />
          <span>My QR Code</span>
        </button>
      </div>

      {/* Onboarding / Store Setup Card */}
      {!loading && (!shopName || editingShop) && (
        <div className="card border-2 border-[#075f47]/30 bg-green-50/40">
          <div className="flex items-center gap-2 mb-1">
            <Store size={20} className="text-[#075f47]" />
            <h3 className="font-bold text-gray-900">{shopName ? 'Edit Store Profile' : 'Set Up Your Store'}</h3>
          </div>
          <p className="text-sm text-gray-500 mb-4">
            {shopName ? 'Update your store name and category.' : 'Add your store name and category so corps members can find you.'}
          </p>
          <form onSubmit={saveShopProfile} className="space-y-4">
            {onboardingError && <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg">{onboardingError}</div>}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Store Name</label>
                <input
                  type="text" required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-[#075f47] focus:border-[#075f47] bg-white"
                  placeholder="e.g. Mama Ngozi's Kitchen"
                  value={onboarding.shopName}
                  onChange={(e) => setOnboarding({ ...onboarding, shopName: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-[#075f47] focus:border-[#075f47] bg-white"
                  value={onboarding.shopCategory}
                  onChange={(e) => setOnboarding({ ...onboarding, shopCategory: e.target.value })}
                >
                  <option value="">Select a category</option>
                  {SHOP_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div className="flex gap-3">
              <button type="submit" disabled={onboardingLoading} className="btn-primary flex items-center gap-2 disabled:opacity-50">
                <Check size={16} /> {onboardingLoading ? 'Saving...' : 'Save Store Profile'}
              </button>
              {editingShop && (
                <button type="button" onClick={() => setEditingShop(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors text-sm">
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>
      )}

      {/* Store name banner (when already set) */}
      {!loading && shopName && !editingShop && (
        <div className="flex items-center justify-between px-4 py-3 bg-green-50 border border-green-200 rounded-xl">
          <div className="flex items-center gap-2">
            <Store size={18} className="text-[#075f47]" />
            <span className="font-medium text-gray-900">{shopName}</span>
            {profile?.vendor?.shopCategory && (
              <span className="text-xs text-gray-500 bg-white border border-gray-200 px-2 py-0.5 rounded-full">{profile.vendor.shopCategory}</span>
            )}
          </div>
          <button
            onClick={() => { setOnboarding({ shopName: shopName, shopCategory: profile?.vendor?.shopCategory || '' }); setEditingShop(true); }}
            className="flex items-center gap-1 text-xs text-[#075f47] hover:underline"
          >
            <Pencil size={13} /> Edit
          </button>
        </div>
      )}

      {/* QR Modal */}
      {showQR && qr && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
            <h3 className="text-lg font-bold text-gray-900 mb-1">Your Payment QR Code</h3>
            <p className="text-sm text-gray-500 mb-4">Corps members scan this to pay your store</p>
            <div className="flex justify-center mb-4">
              <img src={qr} alt="Vendor QR Code" className="w-56 h-56 rounded-xl border border-gray-100" />
            </div>
            <div className="flex gap-3 justify-center">
              <button
                onClick={downloadQR}
                className="flex items-center gap-2 px-4 py-2 bg-[#075f47] text-white rounded-lg text-sm font-medium hover:bg-[#064e3b] transition-colors"
              >
                <Download size={16} /> Download
              </button>
              <button
                onClick={() => setShowQR(false)}
                className="px-4 py-2 border border-gray-200 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-green-50 text-[#075f47] rounded-lg">
              <TrendingUp size={24} />
            </div>
          </div>
          <p className="text-gray-500 text-sm mb-1">Wallet Balance</p>
          <h2 className="text-2xl font-bold text-gray-900">{fmt(profile?.balance)}</h2>
          <p className="mt-2 text-xs text-green-600 font-medium">Available to withdraw</p>
        </div>

        <div className="card">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <ArrowDownLeft size={24} />
            </div>
          </div>
          <p className="text-gray-500 text-sm mb-1">Total Sales</p>
          <h2 className="text-2xl font-bold text-gray-900">{loading ? '...' : profile?.totalSales || 0}</h2>
          <p className="mt-2 text-xs text-blue-600 font-medium">Completed payments</p>
        </div>

        <div className="card">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
              <Store size={24} />
            </div>
          </div>
          <p className="text-gray-500 text-sm mb-1">Store Status</p>
          <h2 className="text-2xl font-bold text-gray-900">Active</h2>
          <p className="mt-2 text-xs text-purple-600 font-medium">Accepting payments</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="card">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold">Recent Sales</h3>
            <RefreshCw size={16} className="text-gray-400 cursor-pointer hover:text-[#075f47]" onClick={loadQR} />
          </div>
          {!loading && profile?.recentSales?.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {profile.recentSales.map((tx) => (
                <div key={tx.id} className="py-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{tx.description || 'Sale'}</p>
                    <p className="text-xs text-gray-500">{new Date(tx.createdAt).toLocaleDateString()}</p>
                  </div>
                  <span className="font-bold text-[#075f47]">+{fmt(tx.amount)}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-400">
              <ArrowDownLeft size={48} className="mx-auto mb-4 opacity-20" />
              <p>No sales yet. Share your QR code to start receiving payments.</p>
            </div>
          )}
        </div>

        <div className="card">
          <h3 className="text-lg font-bold mb-6">How to get paid</h3>
          <div className="space-y-4">
            {[
              { step: '1', text: 'Click "My QR Code" above to generate your unique QR' },
              { step: '2', text: 'Download and print the QR code for your store' },
              { step: '3', text: 'Corps members scan it with their Mami Pay app' },
              { step: '4', text: 'Payment is instantly credited to your wallet' },
            ].map(({ step, text }) => (
              <div key={step} className="flex items-start gap-3">
                <span className="flex-shrink-0 w-7 h-7 rounded-full bg-[#075f47] text-white text-sm font-bold flex items-center justify-center">
                  {step}
                </span>
                <p className="text-sm text-gray-600 pt-1">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorDashboard;
