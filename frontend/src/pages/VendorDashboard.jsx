import React, { useState, useEffect } from 'react';
import { Store, TrendingUp, Users, QrCode, Download, ArrowDownLeft, RefreshCw } from 'lucide-react';
import api from '../services/api';

const fmt = (n) => `₦${parseFloat(n || 0).toLocaleString()}`;

const VendorDashboard = ({ user }) => {
  const [qr, setQr] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showQR, setShowQR] = useState(false);

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
