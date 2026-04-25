'use client';
import { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useToast } from '@/components/ui/Toaster';
import { useAuthStore } from '@/store/authStore';
import { useApi } from '@/hooks/useApi';
import { Settings, Globe, Shield, Bell, CreditCard, Eye, EyeOff, Lock } from 'lucide-react';

const tabs = [
  { id: 'general', label: 'General', icon: Globe },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'billing', label: 'Billing', icon: CreditCard },
];

const PLAN_PRICES = { FREE: 0, BASIC: 999, PREMIUM: 4999, ENTERPRISE: 19999 };

export default function AdminSettingsPage() {
  const { showToast } = useToast();
  const { request } = useApi();
  const { user, updateUser } = useAuthStore();
  const [tab, setTab] = useState('general');
  const [saving, setSaving] = useState(false);
  const [showPw, setShowPw] = useState({ current: false, new: false, confirm: false });

  const [general, setGeneral] = useState({
    siteName: 'B2B Marketplace',
    siteDescription: "India's trusted B2B marketplace connecting buyers and suppliers",
    supportEmail: 'support@b2bmarket.com',
    contactPhone: '+91 98765 43210',
    defaultCurrency: 'INR',
    defaultLanguage: 'en',
    maintenanceMode: false,
    allowRegistrations: true,
    requireEmailVerification: true,
    autoApproveVendors: false,
  });

  const [passwords, setPasswords] = useState({ current: '', newPass: '', confirm: '' });

  const [notifSettings, setNotifSettings] = useState({
    emailNewVendor: true,
    emailNewInquiry: false,
    emailDailyReport: true,
    emailWeeklyReport: true,
    systemAlerts: true,
  });

  const saveGeneral = () => { showToast('Settings saved!', 'success'); };

  const changePassword = async () => {
    if (!passwords.current || !passwords.newPass) { showToast('Fill all fields', 'error'); return; }
    if (passwords.newPass !== passwords.confirm) { showToast('Passwords do not match', 'error'); return; }
    if (passwords.newPass.length < 8) { showToast('Min 8 characters', 'error'); return; }
    setSaving(true);
    const res = await request('/api/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword: passwords.current, newPassword: passwords.newPass }),
    });
    setSaving(false);
    if (res) { showToast('Password changed!', 'success'); setPasswords({ current: '', newPass: '', confirm: '' }); }
    else showToast('Failed — check current password', 'error');
  };

  const Toggle = ({ value, onChange }: { value: boolean; onChange: () => void }) => (
    <button onClick={onChange}
      className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${value ? 'bg-brand-500' : 'bg-gray-200'}`}>
      <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${value ? 'translate-x-1' : 'left-1 translate-x-0'}`} />
    </button>
  );

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Settings className="h-6 w-6 text-brand-600" /> Admin Settings
        </h1>
        <p className="text-gray-500 text-sm">Configure platform-wide settings</p>
      </div>

      <div className="flex gap-6 flex-col md:flex-row">
        {/* Sidebar */}
        <div className="md:w-52 flex-shrink-0">
          <div className="card p-2 space-y-1">
            {tabs.map(({ id, label, icon: Icon }) => (
              <button key={id} onClick={() => setTab(id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors text-left ${
                  tab === id ? 'bg-brand-50 text-brand-700' : 'text-gray-600 hover:bg-gray-50'
                }`}>
                <Icon className="h-4 w-4 flex-shrink-0" />{label}
              </button>
            ))}
          </div>

          {/* Admin info */}
          <div className="card mt-4 bg-brand-50 border-brand-100 p-3">
            <p className="text-xs font-semibold text-brand-700 mb-1">Logged in as</p>
            <p className="text-sm font-bold text-gray-900">{user?.name}</p>
            <p className="text-xs text-gray-500">{user?.email}</p>
            <span className="mt-2 inline-block badge bg-red-100 text-red-700 text-xs">{user?.role}</span>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 space-y-5">

          {/* General */}
          {tab === 'general' && (
            <>
              <div className="card space-y-5 p-4">
                <h2 className="text-base font-semibold text-gray-900">Site Information</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Site Name</label>
                    <input value={general.siteName} onChange={e => setGeneral(g => ({ ...g, siteName: e.target.value }))} className="input" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Support Email</label>
                    <input value={general.supportEmail} onChange={e => setGeneral(g => ({ ...g, supportEmail: e.target.value }))} className="input" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Contact Phone</label>
                    <input value={general.contactPhone} onChange={e => setGeneral(g => ({ ...g, contactPhone: e.target.value }))} className="input" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Default Currency</label>
                    <select value={general.defaultCurrency} onChange={e => setGeneral(g => ({ ...g, defaultCurrency: e.target.value }))} className="input">
                      <option value="INR">INR — Indian Rupee</option>
                      <option value="USD">USD — US Dollar</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Site Description</label>
                  <textarea value={general.siteDescription} onChange={e => setGeneral(g => ({ ...g, siteDescription: e.target.value }))} rows={2} className="input resize-none" />
                </div>
              </div>

              <div className="card space-y-3 p-4">
                <h2 className="text-base font-semibold text-gray-900">Platform Controls</h2>
                {[
                  { key: 'maintenanceMode', label: 'Maintenance Mode', desc: 'Take the site offline for maintenance. Only admins can access.' },
                  { key: 'allowRegistrations', label: 'Allow Registrations', desc: 'Allow new users to register on the platform.' },
                  { key: 'requireEmailVerification', label: 'Require Email Verification', desc: 'New users must verify email before accessing the platform.' },
                  { key: 'autoApproveVendors', label: 'Auto-Approve Vendors', desc: 'Automatically approve vendor registrations without manual review.' },
                ].map(({ key, label, desc }) => (
                  <label key={key} className="flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:bg-gray-50 cursor-pointer">
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{label}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
                    </div>
                    <Toggle value={(general as any)[key]} onChange={() => setGeneral(g => ({ ...g, [key]: !(g as any)[key] }))} />
                  </label>
                ))}
              </div>
              <button onClick={saveGeneral} className="btn-primary">Save Settings</button>
            </>
          )}

          {/* Security */}
          {tab === 'security' && (
            <div className="card space-y-5 p-4">
              <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                <Lock className="h-5 w-5 text-gray-600" /> Change Admin Password
              </h2>
              {(['current', 'newPass', 'confirm'] as const).map((field, i) => {
                const labels = ['Current Password', 'New Password', 'Confirm New Password'];
                const keys: Array<keyof typeof showPw> = ['current', 'new', 'confirm'];
                const vals = { current: passwords.current, newPass: passwords.newPass, confirm: passwords.confirm };
                return (
                  <div key={field}>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">{labels[i]}</label>
                    <div className="relative">
                      <input
                        type={showPw[keys[i]] ? 'text' : 'password'}
                        value={(vals as any)[field]}
                        onChange={e => setPasswords(p => ({ ...p, [field]: e.target.value }))}
                        className="input pr-10"
                        placeholder="••••••••"
                      />
                      <button type="button" onClick={() => setShowPw(s => ({ ...s, [keys[i]]: !s[keys[i]] }))}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                        {showPw[keys[i]] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                );
              })}
              {passwords.confirm && passwords.newPass !== passwords.confirm && (
                <p className="text-xs text-red-500">Passwords do not match</p>
              )}
              <button onClick={changePassword} disabled={saving} className="btn-primary">
                {saving ? 'Updating...' : 'Update Password'}
              </button>
            </div>
          )}

          {/* Notifications */}
          {tab === 'notifications' && (
            <div className="card space-y-3 p-4">
              <h2 className="text-base font-semibold text-gray-900 mb-2">Admin Notification Preferences</h2>
              {[
                { key: 'emailNewVendor', label: 'New vendor registration', desc: 'Email when a new vendor registers and needs approval' },
                { key: 'emailNewInquiry', label: 'New inquiry created', desc: 'Email for every new inquiry on the platform' },
                { key: 'emailDailyReport', label: 'Daily report', desc: 'Daily summary of platform activity' },
                { key: 'emailWeeklyReport', label: 'Weekly report', desc: 'Weekly analytics summary' },
                { key: 'systemAlerts', label: 'System alerts', desc: 'Critical system errors and warnings' },
              ].map(({ key, label, desc }) => (
                <label key={key} className="flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:bg-gray-50 cursor-pointer">
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{label}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
                  </div>
                  <Toggle
                    value={(notifSettings as any)[key]}
                    onChange={() => setNotifSettings(n => ({ ...n, [key]: !(n as any)[key] }))}
                  />
                </label>
              ))}
              <button onClick={() => showToast('Notification preferences saved!', 'success')} className="btn-primary mt-2">Save Preferences</button>
            </div>
          )}

          {/* Billing / Plan info */}
          {tab === 'billing' && (
            <div className="space-y-5 ">
              <div className="card p-4">
                <h2 className="text-base font-semibold text-gray-900 mb-4">Subscription Plan Pricing</h2>
                <p className="text-sm text-gray-500 mb-5">Current platform subscription tiers offered to vendors.</p>
                <div className="space-y-3">
                  {Object.entries(PLAN_PRICES).map(([plan, price]) => {
                    const COLORS: Record<string, string> = { FREE: 'bg-gray-100 text-gray-600', BASIC: 'bg-blue-100 text-blue-700', PREMIUM: 'bg-brand-100 text-brand-700', ENTERPRISE: 'bg-purple-100 text-purple-700' };
                    return (
                      <div key={plan} className="flex items-center justify-between p-4 rounded-xl border border-gray-100">
                        <div className="flex items-center gap-3">
                          <span className={`badge text-xs ${COLORS[plan]}`}>{plan}</span>
                          <span className="text-sm text-gray-600">
                            {plan === 'FREE' ? 'Free forever' : plan === 'PREMIUM' || plan === 'ENTERPRISE' ? 'Annual billing' : 'Monthly billing'}
                          </span>
                        </div>
                        <span className="font-bold text-gray-900">
                          {price === 0 ? 'Free' : `₹${price.toLocaleString()}`}
                        </span>
                      </div>
                    );
                  })}
                </div>
                <p className="text-xs text-gray-400 mt-4">To update pricing, modify the PLANS constant in <code className="bg-gray-100 px-1 rounded">/app/api/subscriptions/route.ts</code></p>
              </div>

              <div className="card bg-brand-50 border-brand-100 p-4">
                <h3 className="text-sm font-semibold text-brand-700 mb-2">Payment Gateway</h3>
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 bg-green-500 rounded-full" />
                  <span className="text-sm font-medium text-gray-800">Razorpay — Connected</span>
                </div>
                <p className="text-xs text-gray-500 mt-2">Configure keys in <code className="bg-brand-100 px-1 rounded">.env</code> file</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
