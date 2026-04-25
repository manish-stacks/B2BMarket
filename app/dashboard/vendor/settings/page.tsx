'use client';
import { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useApi } from '@/hooks/useApi';
import { useToast } from '@/components/ui/Toaster';
import { useAuthStore } from '@/store/authStore';
import { Settings, Lock, Bell, Trash2, Shield, Eye, EyeOff } from 'lucide-react';

const tabs = [
  { id: 'account', label: 'Account', icon: Settings },
  { id: 'security', label: 'Security', icon: Lock },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'danger', label: 'Danger Zone', icon: Trash2 },
];

const NOTIF_SETTINGS = [
  { key: 'emailNewInquiry', label: 'New inquiry received', desc: 'Email when a buyer sends an inquiry', default: true },
  { key: 'emailInquiryUpdate', label: 'Inquiry status update', desc: 'Email when inquiry status changes', default: true },
  { key: 'emailOrderNew', label: 'New order placed', desc: 'Email when a buyer places an order', default: true },
  { key: 'emailPayment', label: 'Payment received', desc: 'Email when payment is confirmed', default: true },
  { key: 'emailPromo', label: 'Promotions & tips', desc: 'Tips to grow your business on the platform', default: false },
  { key: 'emailWeeklyReport', label: 'Weekly report', desc: 'Weekly summary of your store performance', default: true },
];

export default function VendorSettingsPage() {
  const { request } = useApi();
  const { showToast } = useToast();
  const { user, updateUser, logout } = useAuthStore();
  const [tab, setTab] = useState('account');
  const [saving, setSaving] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [profile, setProfile] = useState({ name: user?.name || '', email: user?.email || '' });
  const [passwords, setPasswords] = useState({ current: '', newPass: '', confirm: '' });
  const [notifs, setNotifs] = useState<Record<string, boolean>>(
    Object.fromEntries(NOTIF_SETTINGS.map(n => [n.key, n.default]))
  );

  const saveProfile = async () => {
    setSaving(true);
    const res = await request('/api/auth/me', {
      method: 'PATCH',
      body: JSON.stringify({ name: profile.name }),
    });
    setSaving(false);
    if (res) { updateUser({ name: profile.name }); showToast('Profile updated!', 'success'); }
    else showToast('Update failed', 'error');
  };

  const changePassword = async () => {
    if (!passwords.current || !passwords.newPass || !passwords.confirm) {
      showToast('All fields required', 'error'); return;
    }
    if (passwords.newPass !== passwords.confirm) {
      showToast('New passwords do not match', 'error'); return;
    }
    if (passwords.newPass.length < 8) {
      showToast('Password must be at least 8 characters', 'error'); return;
    }
    setSaving(true);
    const res = await request('/api/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword: passwords.current, newPassword: passwords.newPass }),
    });
    setSaving(false);
    if (res) { showToast('Password changed!', 'success'); setPasswords({ current: '', newPass: '', confirm: '' }); }
    else showToast('Failed — check current password', 'error');
  };

  const saveNotifs = () => showToast('Notification preferences saved!', 'success');

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500 text-sm">Manage your account preferences</p>
      </div>

      <div className="flex gap-6 flex-col md:flex-row">
        {/* Sidebar tabs */}
        <div className="md:w-52 flex-shrink-0">
          <div className="card p-2 space-y-1">
            {tabs.map(({ id, label, icon: Icon }) => (
              <button key={id} onClick={() => setTab(id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors text-left ${tab === id
                  ? id === 'danger' ? 'bg-red-50 text-red-600' : 'bg-brand-50 text-brand-700'
                  : id === 'danger' ? 'text-red-500 hover:bg-red-50' : 'text-gray-600 hover:bg-gray-50'
                  }`}>
                <Icon className="h-4 w-4 flex-shrink-0" />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">

          {/* Account */}
          {tab === 'account' && (
            <div className="card space-y-5 p-4">
              <h2 className="text-lg font-semibold text-gray-900">Account Information</h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
                <input value={profile.name} onChange={e => setProfile(p => ({ ...p, name: e.target.value }))}
                  className="input" placeholder="Your name" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
                <input value={profile.email} className="input bg-gray-50 cursor-not-allowed" disabled />
                <p className="text-xs text-gray-400 mt-1">Email cannot be changed. Contact support if needed.</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Account Role</label>
                <div className="flex items-center gap-2 p-3 bg-brand-50 rounded-xl">
                  <Shield className="h-4 w-4 text-brand-600" />
                  <span className="text-sm font-medium text-brand-700">Vendor</span>
                </div>
              </div>
              <button onClick={saveProfile} disabled={saving} className="btn-primary">
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          )}

          {/* Security */}
          {tab === 'security' && (
            <div className="space-y-5 ">
              <div className="card space-y-5 p-4">
                <h2 className="text-lg font-semibold text-gray-900">Change Password</h2>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Current Password</label>
                  <div className="relative">
                    <input type={showCurrent ? 'text' : 'password'} value={passwords.current}
                      onChange={e => setPasswords(p => ({ ...p, current: e.target.value }))} className="input pr-10" />
                    <button type="button" onClick={() => setShowCurrent(!showCurrent)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                      {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">New Password</label>
                  <div className="relative">
                    <input type={showNew ? 'text' : 'password'} value={passwords.newPass}
                      onChange={e => setPasswords(p => ({ ...p, newPass: e.target.value }))} className="input pr-10" />
                    <button type="button" onClick={() => setShowNew(!showNew)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                      {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {/* Strength indicator */}
                  {passwords.newPass && (
                    <div className="mt-2 flex gap-1">
                      {[1, 2, 3, 4].map(i => (
                        <div key={i} className={`h-1 flex-1 rounded-full ${passwords.newPass.length >= i * 3
                          ? i <= 1 ? 'bg-red-400' : i <= 2 ? 'bg-yellow-400' : i <= 3 ? 'bg-blue-400' : 'bg-green-400'
                          : 'bg-gray-200'
                          }`} />
                      ))}
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm New Password</label>
                  <div className="relative">
                    <input type={showConfirm ? 'text' : 'password'} value={passwords.confirm}
                      onChange={e => setPasswords(p => ({ ...p, confirm: e.target.value }))} className="input pr-10" />
                    <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                      {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {passwords.confirm && passwords.newPass !== passwords.confirm && (
                    <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
                  )}
                </div>
                <button onClick={changePassword} disabled={saving} className="btn-primary">
                  {saving ? 'Updating...' : 'Update Password'}
                </button>
              </div>

              <div className="card p-4">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Active Sessions</h2>
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-2.5 h-2.5 bg-green-500 rounded-full" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Current session</p>
                      <p className="text-xs text-gray-400">Browser · {new Date().toLocaleDateString()}</p>
                    </div>
                  </div>
                  <span className="text-xs text-green-600 font-medium">Active</span>
                </div>
              </div>
            </div>
          )}

          {/* Notifications */}
          {tab === 'notifications' && (
            <div className="card p-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-5">Email Notifications</h2>
              <div className="space-y-3">
                {NOTIF_SETTINGS.map(({ key, label, desc }) => (
                  <label key={key} className="flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors">
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{label}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
                    </div>
                    <button
                      onClick={() => setNotifs(n => ({ ...n, [key]: !n[key] }))}
                      className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ml-4 ${notifs[key] ? 'bg-brand-500' : 'bg-gray-200'}`}>
                      <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${notifs[key] ? 'translate-x-1' : 'left-1 translate-x-0'}`} />
                    </button>
                  </label>
                ))}
              </div>
              <button onClick={saveNotifs} className="btn-primary mt-6">Save Preferences</button>
            </div>
          )}

          {/* Danger zone */}
          {tab === 'danger' && (
            <div className="space-y-4">
              <div className="card border-red-200 bg-red-50 p-4">
                <h2 className="text-lg font-semibold text-red-700 mb-2">Danger Zone</h2>
                <p className="text-sm text-red-600 mb-6">These actions are irreversible. Please proceed with caution.</p>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-red-100">
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">Deactivate Account</p>
                      <p className="text-xs text-gray-500 mt-0.5">Temporarily hide your store and products from buyers</p>
                    </div>
                    <button className="px-4 py-2 bg-yellow-100 text-yellow-700 hover:bg-yellow-200 rounded-lg text-sm font-semibold transition-colors">
                      Deactivate
                    </button>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-red-100">
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">Delete Account</p>
                      <p className="text-xs text-gray-500 mt-0.5">Permanently delete your account and all data</p>
                    </div>
                    <button
                      onClick={() => { if (confirm('Are you sure? This cannot be undone.')) { logout(); window.location.href = '/'; } }}
                      className="px-4 py-2 bg-red-100 text-red-700 hover:bg-red-500 hover:text-white rounded-lg text-sm font-semibold transition-colors">
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
