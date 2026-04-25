'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useApi } from '@/hooks/useApi';
import { useToast } from '@/components/ui/Toaster';
import { useAuthStore } from '@/store/authStore';

export default function BuyerSettingsPage() {
  const { request } = useApi();
  const { showToast } = useToast();
  const { user, updateUser } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [profile, setProfile] = useState({ name: user?.name || '', phone: '', avatar: user?.avatar || '' });
  const [passwords, setPasswords] = useState({ current: '', newPass: '', confirm: '' });
  const [activeTab, setActiveTab] = useState('profile');

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfile(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingAvatar(true);
    const fd = new FormData();
    fd.append('file', file);
    const res = await request('/api/upload', { method: 'POST', body: fd });
    if (res?.url) setProfile(prev => ({ ...prev, avatar: res.url }));
    setUploadingAvatar(false);
  };

  const saveProfile = async () => {
    setLoading(true);
    const res = await request('/api/auth/me', {
      method: 'PATCH',
      body: JSON.stringify({ name: profile.name, avatar: profile.avatar }),
    });
    setLoading(false);
    if (res) {
      showToast('Profile updated!', 'success');
      updateUser({ ...user!, ...res });
    } else {
      showToast(res?.error || 'Update failed', 'error');
    }
  };

  const changePassword = async () => {
    if (passwords.newPass !== passwords.confirm) { showToast('Passwords do not match', 'error'); return; }
    if (passwords.newPass.length < 8) { showToast('Password must be at least 8 characters', 'error'); return; }
    setLoading(true);
    const res = await request('/api/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword: passwords.current, newPassword: passwords.newPass }),
    });
    setLoading(false);
    if (res) {
      showToast('Password changed!', 'success');
      setPasswords({ current: '', newPass: '', confirm: '' });
    } else {
      showToast(res?.error || 'Failed to change password', 'error');
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile' },
    { id: 'security', label: 'Security' },
    { id: 'notifications', label: 'Notifications' },
  ];

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-500 text-sm">Manage your account preferences</p>
        </div>

        <div className="flex gap-1 bg-gray-100 p-1 rounded-xl mb-6">
          {tabs.map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === t.id ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>
              {t.label}
            </button>
          ))}
        </div>

        {activeTab === 'profile' && (
          <div className="space-y-6">
            <div className="card p-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Profile Picture</h2>
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 rounded-full bg-brand-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                  {profile.avatar
                    ? <img src={profile.avatar} alt="" className="w-full h-full object-cover" />
                    : <span className="text-2xl font-bold text-brand-600">{user?.name?.[0]?.toUpperCase() || 'U'}</span>
                  }
                </div>
                <div>
                  <label className="btn-secondary text-sm cursor-pointer inline-block">
                    {uploadingAvatar ? 'Uploading...' : 'Change Photo'}
                    <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
                  </label>
                  <p className="text-xs text-gray-400 mt-2">JPG, PNG up to 5MB</p>
                </div>
              </div>
            </div>

            <div className="card p-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input name="name" value={profile.name} onChange={handleProfileChange} className="input" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input value={user?.email || ''} className="input bg-gray-50" disabled />
                  <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input name="phone" value={profile.phone} onChange={handleProfileChange} className="input" placeholder="+91..." />
                </div>
              </div>
              <div className="mt-6">
                <button onClick={saveProfile} disabled={loading} className="btn-primary">
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'security' && (
          <div className="card p-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Change Password</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                <input type="password" value={passwords.current} onChange={e => setPasswords(p => ({ ...p, current: e.target.value }))} className="input" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                <input type="password" value={passwords.newPass} onChange={e => setPasswords(p => ({ ...p, newPass: e.target.value }))} className="input" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                <input type="password" value={passwords.confirm} onChange={e => setPasswords(p => ({ ...p, confirm: e.target.value }))} className="input" />
              </div>
              <button onClick={changePassword} disabled={loading} className="btn-primary mt-2">
                {loading ? 'Updating...' : 'Update Password'}
              </button>
            </div>
          </div>
        )}

        {activeTab === 'notifications' && (
          <div className="card p-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Notification Preferences</h2>
            <div className="space-y-4">
              {[
                { key: 'emailInquiry', label: 'Inquiry responses', desc: 'Get email when a vendor responds to your inquiry' },
                { key: 'emailOrder', label: 'Order updates', desc: 'Get email when your order status changes' },
                { key: 'emailPromo', label: 'Promotions', desc: 'Receive deal alerts and featured product notifications' },
                { key: 'pushAll', label: 'Push notifications', desc: 'Browser push notifications for all activity' },
              ].map(({ key, label, desc }) => (
                <label key={key} className="flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:bg-gray-50 cursor-pointer">
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{label}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
                  </div>
                  <div className="relative ml-4">
                    <input type="checkbox" className="sr-only peer" defaultChecked={key !== 'emailPromo'} />
                    <div className="w-10 h-6 bg-gray-200 rounded-full peer-checked:bg-brand-500 transition-colors" />
                    <div className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow peer-checked:translate-x-4 transition-transform" />
                  </div>
                </label>
              ))}
            </div>
            <button className="btn-primary mt-6">Save Preferences</button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
