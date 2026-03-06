import React, { useState, useEffect } from 'react';
import { User, Lock, Save, BadgeCheck, KeyRound } from 'lucide-react';
import api from '../services/api';

const ROLE_LABELS = { corper: 'Corps Member', vendor: 'Vendor', admin: 'Admin' };

const Profile = ({ user, onProfileUpdate }) => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ firstName: '', lastName: '', phoneNumber: '', callUpDate: '' });
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [saveMsg, setSaveMsg] = useState('');
  const [saveErr, setSaveErr] = useState('');
  const [pwMsg, setPwMsg] = useState('');
  const [pwErr, setPwErr] = useState('');
  const [saving, setSaving] = useState(false);
  const [changingPw, setChangingPw] = useState(false);

  const token = localStorage.getItem('token');
  const config = { headers: { Authorization: `Bearer ${token}` } };

  useEffect(() => {
    api.get('/api/auth/profile', config)
      .then(r => {
        const u = r.data.user;
        setProfile(u);
        setForm({
          firstName: u.firstName || '',
          lastName: u.lastName || '',
          phoneNumber: u.phoneNumber || '',
          callUpDate: u.callUpDate || '',
        });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []); // eslint-disable-line

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

  const changePassword = async (e) => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      setPwErr('New passwords do not match.'); return;
    }
    setChangingPw(true); setPwMsg(''); setPwErr('');
    try {
      await api.put('/api/auth/change-password', {
        currentPassword: pwForm.currentPassword,
        newPassword: pwForm.newPassword,
      }, config);
      setPwMsg('Password changed successfully.');
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setPwErr(err.response?.data?.error || 'Failed to change password.');
    } finally {
      setChangingPw(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64 text-gray-400">Loading profile...</div>
  );

  const initials = `${profile?.firstName?.[0] || ''}${profile?.lastName?.[0] || ''}`.toUpperCase();
  const roleLabel = ROLE_LABELS[profile?.role] || profile?.role;

  return (
    <div className="max-w-2xl mx-auto space-y-8">

      {/* Avatar header */}
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-[#075f47] flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
          {initials}
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{profile?.firstName} {profile?.lastName}</h1>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <span className="text-sm text-gray-500">{profile?.email}</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-green-100 text-[#075f47]">{roleLabel}</span>
            {profile?.isVerified && (
              <span className="flex items-center gap-1 text-xs text-blue-500 font-medium">
                <BadgeCheck size={14} /> Verified
              </span>
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
                value={form.firstName}
                onChange={e => setForm({ ...form, firstName: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
              <input type="text" required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-[#075f47] focus:border-[#075f47]"
                value={form.lastName}
                onChange={e => setForm({ ...form, lastName: e.target.value })}
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
              value={form.phoneNumber}
              onChange={e => setForm({ ...form, phoneNumber: e.target.value })}
            />
          </div>

          {profile?.role === 'corper' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Call-up Date</label>
              <input type="date"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-[#075f47] focus:border-[#075f47]"
                value={form.callUpDate}
                onChange={e => setForm({ ...form, callUpDate: e.target.value })}
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

      {/* Change password */}
      <div className="card" id="security">
        <div className="flex items-center gap-2 mb-6">
          <KeyRound size={20} className="text-[#075f47]" />
          <h2 className="text-lg font-bold text-gray-900">Change Password</h2>
        </div>
        <form onSubmit={changePassword} className="space-y-4">
          {pwMsg && <div className="p-3 bg-green-50 text-[#075f47] text-sm rounded-lg border border-green-200">{pwMsg}</div>}
          {pwErr && <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg">{pwErr}</div>}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
            <input type="password" required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-[#075f47] focus:border-[#075f47]"
              value={pwForm.currentPassword}
              onChange={e => setPwForm({ ...pwForm, currentPassword: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
              <input type="password" required minLength={6}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-[#075f47] focus:border-[#075f47]"
                value={pwForm.newPassword}
                onChange={e => setPwForm({ ...pwForm, newPassword: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
              <input type="password" required minLength={6}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-[#075f47] focus:border-[#075f47]"
                value={pwForm.confirmPassword}
                onChange={e => setPwForm({ ...pwForm, confirmPassword: e.target.value })}
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button type="submit" disabled={changingPw} className="btn-primary flex items-center gap-2 disabled:opacity-50">
              <Lock size={16} /> {changingPw ? 'Changing...' : 'Change Password'}
            </button>
          </div>
        </form>
      </div>

    </div>
  );
};

export default Profile;
