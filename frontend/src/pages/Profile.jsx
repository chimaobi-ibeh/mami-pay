import React, { useState, useEffect, useRef } from 'react';
import { User, Save, BadgeCheck, Camera, Store } from 'lucide-react';
import api from '../services/api';

const ROLE_LABELS = { corper: 'Corps Member', vendor: 'Vendor', admin: 'Admin' };
const SHOP_CATEGORIES = ['Food & Drinks', 'Shopping', 'Services', 'Health & Beauty', 'Electronics', 'Other'];

const Profile = ({ user, onProfileUpdate }) => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({ firstName: '', lastName: '', phoneNumber: '', callUpDate: '' });
  const [saveMsg, setSaveMsg] = useState('');
  const [saveErr, setSaveErr] = useState('');
  const [saving, setSaving] = useState(false);

  const [shopForm, setShopForm] = useState({ shopName: '', shopCategory: '', shopDescription: '' });
  const [shopMsg, setShopMsg] = useState('');
  const [shopErr, setShopErr] = useState('');
  const [savingShop, setSavingShop] = useState(false);

  const [avatar, setAvatar] = useState(() => localStorage.getItem(`avatar_${user?.id}`) || null);
  const fileInputRef = useRef(null);

  const [verifyMsg, setVerifyMsg] = useState('');

  const token = localStorage.getItem('token');
  const config = { headers: { Authorization: `Bearer ${token}` } };

  useEffect(() => {
    api.get('/api/auth/profile', config)
      .then(r => {
        const u = r.data.user;
        setProfile(u);
        setForm({ firstName: u.firstName || '', lastName: u.lastName || '', phoneNumber: u.phoneNumber || '', callUpDate: u.callUpDate || '' });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []); // eslint-disable-line

  useEffect(() => {
    if (profile?.role === 'vendor') {
      api.get('/api/vendor/profile', config)
        .then(r => {
          const v = r.data.vendor;
          setShopForm({ shopName: v.shopName || '', shopCategory: v.shopCategory || '', shopDescription: v.shopDescription || '' });
        })
        .catch(() => {});
    }
  }, [profile?.role]); // eslint-disable-line

  const saveProfile = async (e) => {
    e.preventDefault();
    setSaving(true); setSaveMsg(''); setSaveErr('');
    try {
      await api.put('/api/auth/profile', form, config);
      const stored = JSON.parse(localStorage.getItem('user') || '{}');
      const updated = { ...stored, firstName: form.firstName, lastName: form.lastName };
      localStorage.setItem('user', JSON.stringify(updated));
      if (onProfileUpdate) onProfileUpdate(updated);
      setSaveMsg('Profile updated successfully.');
      setProfile(prev => ({ ...prev, ...form }));
    } catch (err) {
      setSaveErr(err.response?.data?.error || 'Failed to save profile.');
    } finally {
      setSaving(false);
    }
  };

  const saveShop = async (e) => {
    e.preventDefault();
    setSavingShop(true); setShopMsg(''); setShopErr('');
    try {
      await api.put('/api/vendor/profile', shopForm, config);
      setShopMsg('Store profile updated.');
      setTimeout(() => setShopMsg(''), 2500);
    } catch (err) {
      setShopErr(err.response?.data?.error || 'Failed to update store profile.');
    } finally {
      setSavingShop(false);
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const b64 = ev.target.result;
      localStorage.setItem(`avatar_${user.id}`, b64);
      setAvatar(b64);
    };
    reader.readAsDataURL(file);
  };

  const resendVerification = async () => {
    setVerifyMsg('');
    try {
      const res = await api.post('/api/auth/resend-verification', {}, config);
      setVerifyMsg(res.data.message || 'Verification email sent.');
    } catch (err) {
      setVerifyMsg(err.response?.data?.error || 'Unable to resend.');
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64 text-gray-400">Loading profile...</div>
  );

  const initials = `${profile?.firstName?.[0] || ''}${profile?.lastName?.[0] || ''}`.toUpperCase();
  const roleLabel = ROLE_LABELS[profile?.role] || profile?.role;

  return (
    <div className="max-w-2xl mx-auto space-y-8">

      {/* Verification banner */}
      {profile && !profile.isVerified && (
        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-3 text-sm text-yellow-800">
          Your email is not verified. Verify to unlock transfers and payments.
          <button onClick={resendVerification} className="ml-2 font-semibold text-yellow-900 underline">Resend email</button>
          {verifyMsg && <div className="mt-1 text-xs text-yellow-700">{verifyMsg}</div>}
        </div>
      )}

      {/* Avatar + name header */}
      <div className="flex items-center gap-4">
        <div className="relative flex-shrink-0">
          {avatar ? (
            <img src={avatar} alt="avatar" className="w-16 h-16 rounded-full object-cover" />
          ) : (
            <div className="w-16 h-16 rounded-full bg-[#075f47] flex items-center justify-center text-white text-2xl font-bold">
              {initials}
            </div>
          )}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="absolute bottom-0 right-0 w-6 h-6 bg-white rounded-full border border-gray-200 flex items-center justify-center shadow hover:bg-gray-50 transition-colors"
            title="Change photo"
          >
            <Camera size={12} className="text-gray-600" />
          </button>
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{profile?.firstName} {profile?.lastName}</h1>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <span className="text-sm text-gray-500">{profile?.email}</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-green-100 text-[#075f47]">{roleLabel}</span>
            {profile?.isVerified ? (
              <span className="flex items-center gap-1 text-xs text-blue-500 font-medium">
                <BadgeCheck size={14} /> Verified
              </span>
            ) : (
              <span className="text-xs text-yellow-600 font-medium">Unverified</span>
            )}
          </div>
        </div>
      </div>

      {/* Personal info */}
      <div className="card">
        <div className="flex items-center gap-2 mb-6">
          <User size={20} className="text-[#075f47]" />
          <h2 className="text-lg font-bold text-gray-900">Personal Information</h2>
        </div>
        <form onSubmit={saveProfile} className="space-y-4">
          {saveMsg && <div className="p-3 bg-green-50 text-[#075f47] text-sm rounded-lg border border-green-200">{saveMsg}</div>}
          {saveErr && <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg">{saveErr}</div>}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
              <input type="text" required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-[#075f47] focus:border-[#075f47]"
                value={form.firstName} onChange={e => setForm({ ...form, firstName: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
              <input type="text" required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-[#075f47] focus:border-[#075f47]"
                value={form.lastName} onChange={e => setForm({ ...form, lastName: e.target.value })}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email address</label>
            <input type="email" disabled
              className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-400 cursor-not-allowed"
              value={profile?.email}
            />
            <p className="text-xs text-gray-400 mt-1">Email cannot be changed.</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
            <input type="tel"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-[#075f47] focus:border-[#075f47]"
              placeholder="+234..."
              value={form.phoneNumber} onChange={e => setForm({ ...form, phoneNumber: e.target.value })}
            />
          </div>
          {profile?.role === 'corper' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Call-up Date</label>
              <input type="date"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-[#075f47] focus:border-[#075f47]"
                value={form.callUpDate} onChange={e => setForm({ ...form, callUpDate: e.target.value })}
              />
            </div>
          )}
          {profile?.nyscServiceNumber && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">NYSC Service Number</label>
              <input type="text" disabled
                className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-400 cursor-not-allowed"
                value={profile.nyscServiceNumber}
              />
            </div>
          )}
          <div className="flex justify-end pt-2">
            <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2 disabled:opacity-50">
              <Save size={16} /> {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>

      {/* Vendor store profile */}
      {profile?.role === 'vendor' && (
        <div className="card">
          <div className="flex items-center gap-2 mb-6">
            <Store size={20} className="text-[#075f47]" />
            <h2 className="text-lg font-bold text-gray-900">Store Profile</h2>
          </div>
          <form onSubmit={saveShop} className="space-y-4">
            {shopMsg && <div className="p-3 bg-green-50 text-[#075f47] text-sm rounded-lg border border-green-200">{shopMsg}</div>}
            {shopErr && <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg">{shopErr}</div>}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Shop Name</label>
              <input type="text"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-[#075f47] focus:border-[#075f47]"
                placeholder="e.g. Mama's Kitchen"
                value={shopForm.shopName} onChange={e => setShopForm({ ...shopForm, shopName: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-[#075f47] focus:border-[#075f47]"
                value={shopForm.shopCategory} onChange={e => setShopForm({ ...shopForm, shopCategory: e.target.value })}
              >
                <option value="">Select a category</option>
                {SHOP_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-[#075f47] focus:border-[#075f47]"
                rows={3}
                placeholder="Tell customers what you sell..."
                value={shopForm.shopDescription} onChange={e => setShopForm({ ...shopForm, shopDescription: e.target.value })}
              />
            </div>
            <div className="flex justify-end pt-2">
              <button type="submit" disabled={savingShop} className="btn-primary flex items-center gap-2 disabled:opacity-50">
                <Save size={16} /> {savingShop ? 'Saving...' : 'Save Store Profile'}
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};

export default Profile;
