import React, { useState } from 'react';
import { Lock, KeyRound, Bell, AlertTriangle } from 'lucide-react';
import api from '../services/api';

const passwordStrength = (value) => ({
  minLength: value.length >= 8,
  hasUpper: /[A-Z]/.test(value),
  hasLower: /[a-z]/.test(value),
  hasNumber: /\d/.test(value),
});

const Settings = ({ user }) => {
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [pwMsg, setPwMsg] = useState('');
  const [pwErr, setPwErr] = useState('');
  const [changingPw, setChangingPw] = useState(false);

  const [notifPrefs, setNotifPrefs] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(`notifPrefs_${user?.id}`)) || {
        transferEmail: true, receiveEmail: true, securityEmail: true
      };
    } catch {
      return { transferEmail: true, receiveEmail: true, securityEmail: true };
    }
  });

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteInput, setDeleteInput] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [deleteErr, setDeleteErr] = useState('');

  const token = localStorage.getItem('token');
  const config = { headers: { Authorization: `Bearer ${token}` } };

  const changePassword = async (e) => {
    e.preventDefault();
    const strength = passwordStrength(pwForm.newPassword);
    if (!strength.minLength || !strength.hasUpper || !strength.hasLower || !strength.hasNumber) {
      setPwErr('Password must be at least 8 characters with uppercase, lowercase, and a number.'); return;
    }
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

  const saveNotifPrefs = (prefs) => {
    localStorage.setItem(`notifPrefs_${user.id}`, JSON.stringify(prefs));
    setNotifPrefs(prefs);
  };

  const handleDeleteAccount = async () => {
    setDeleting(true); setDeleteErr('');
    try {
      await api.delete('/api/auth/account', config);
      localStorage.clear();
      window.location.href = '/';
    } catch (err) {
      setDeleteErr(err.response?.data?.error || 'Deletion failed. Please try again.');
      setDeleting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500">Manage your security and preferences.</p>
      </div>

      {/* Change password */}
      <div className="card">
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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
            <input type="password" required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-[#075f47] focus:border-[#075f47]"
              value={pwForm.newPassword}
              onChange={e => setPwForm({ ...pwForm, newPassword: e.target.value })}
            />
            {pwForm.newPassword && (
              <div className="grid grid-cols-2 gap-2 text-xs mt-2">
                {Object.entries(passwordStrength(pwForm.newPassword)).map(([key, valid]) => (
                  <div key={key} className={`px-2 py-1 rounded ${valid ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {key === 'minLength' ? '8+ characters' : key === 'hasUpper' ? 'Uppercase' : key === 'hasLower' ? 'Lowercase' : 'Number'}
                  </div>
                ))}
              </div>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
            <input type="password" required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-[#075f47] focus:border-[#075f47]"
              value={pwForm.confirmPassword}
              onChange={e => setPwForm({ ...pwForm, confirmPassword: e.target.value })}
            />
          </div>
          <div className="flex justify-end pt-2">
            <button type="submit" disabled={changingPw} className="btn-primary flex items-center gap-2 disabled:opacity-50">
              <Lock size={16} /> {changingPw ? 'Changing...' : 'Change Password'}
            </button>
          </div>
        </form>
      </div>

      {/* Notification preferences */}
      <div className="card">
        <div className="flex items-center gap-2 mb-6">
          <Bell size={20} className="text-[#075f47]" />
          <h2 className="text-lg font-bold text-gray-900">Notification Preferences</h2>
        </div>
        <div className="space-y-1">
          {[
            { key: 'transferEmail', label: 'Transfer confirmations', desc: 'Email when you send money' },
            { key: 'receiveEmail', label: 'Received funds', desc: 'Email when money is sent to you' },
            { key: 'securityEmail', label: 'Security alerts', desc: 'Email for password changes and logins' },
          ].map(({ key, label, desc }) => (
            <div key={key} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
              <div>
                <p className="text-sm font-medium text-gray-900">{label}</p>
                <p className="text-xs text-gray-400">{desc}</p>
              </div>
              <button
                type="button"
                onClick={() => saveNotifPrefs({ ...notifPrefs, [key]: !notifPrefs[key] })}
                className={`relative inline-flex h-5 w-9 flex-shrink-0 items-center rounded-full transition-colors ${notifPrefs[key] ? 'bg-[#075f47]' : 'bg-gray-200'}`}
              >
                <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${notifPrefs[key] ? 'translate-x-4' : 'translate-x-0.5'}`} />
              </button>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-400 mt-3">Preferences saved locally on this device.</p>
      </div>

      {/* Danger zone */}
      <div className="card border border-red-100">
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle size={20} className="text-red-500" />
          <h2 className="text-lg font-bold text-red-600">Danger Zone</h2>
        </div>
        <p className="text-sm text-gray-500 mb-4">
          Permanently delete your account, wallet, and all transaction history. This cannot be undone.
        </p>
        {!showDeleteConfirm ? (
          <button
            type="button"
            onClick={() => setShowDeleteConfirm(true)}
            className="px-4 py-2 text-sm font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
          >
            Delete Account
          </button>
        ) : (
          <div className="space-y-3 p-4 bg-red-50 rounded-lg border border-red-100">
            <p className="text-sm text-red-700 font-medium">Type <strong>DELETE</strong> to confirm:</p>
            <input
              type="text"
              className="w-full px-3 py-2 border border-red-200 rounded-lg text-sm focus:ring-red-400 focus:border-red-400"
              placeholder="Type DELETE"
              value={deleteInput}
              onChange={e => setDeleteInput(e.target.value)}
            />
            {deleteErr && <p className="text-xs text-red-600">{deleteErr}</p>}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => { setShowDeleteConfirm(false); setDeleteInput(''); setDeleteErr(''); }}
                className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleteInput !== 'DELETE' || deleting}
                onClick={handleDeleteAccount}
                className="px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 disabled:opacity-50 transition-colors"
              >
                {deleting ? 'Deleting...' : 'Permanently Delete Account'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Settings;
