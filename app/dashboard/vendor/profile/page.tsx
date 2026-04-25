'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useApi } from '@/hooks/useApi';
import { useToast } from '@/components/ui/Toaster';
import { useAuthStore } from '@/store/authStore';

const BUSINESS_TYPES = ['Manufacturer', 'Trader', 'Distributor', 'Retailer', 'Wholesaler', 'Exporter', 'Importer', 'Service Provider'];
const EMPLOYEE_RANGES = ['1-10', '11-50', '51-200', '201-500', '500+'];

export default function VendorProfilePage() {
  const { request } = useApi();
  const { showToast } = useToast();
  const { user, updateUser } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [form, setForm] = useState({
    companyName: '', description: '', website: '', gstNumber: '',
    businessType: '', employeeCount: '', yearEstablished: '',
    address: '', city: '', state: '', pincode: '',
    phone: '', whatsapp: '',
    logo: '',
    name: '', email: '',
  });

  useEffect(() => {
    if (user) {
      setForm(prev => ({
        ...prev,
        name: user.name || '',
        email: user.email || '',
        companyName: user.vendor?.companyName || '',
        description: user.vendor?.description || '',
        website: user.vendor?.website || '',
        gstNumber: user.vendor?.gstNumber || '',
        businessType: user.vendor?.businessType || '',
        employeeCount: user.vendor?.employeeCount || '',
        yearEstablished: user.vendor?.yearEstablished ? String(user.vendor.yearEstablished) : '',
        address: user.vendor?.address || '',
        city: user.vendor?.city || '',
        state: user.vendor?.state || '',
        pincode: user.vendor?.pincode || '',
        phone: user.vendor?.phone || '',
        whatsapp: user.vendor?.whatsapp || '',
        logo: user.vendor?.logo || '',
      }));
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingLogo(true);
    const fd = new FormData();
    fd.append('file', file);
    const res = await request('/api/upload', { method: 'POST', body: fd });
    if (res?.url || res?.secure_url) setForm(prev => ({ ...prev, logo: res.url }));
    setUploadingLogo(false);
  };

  const handleSubmit = async () => {
    setLoading(true);
    const res = await request(`/api/vendors/${user?.vendor?.id}`, {
      method: 'PATCH',
      body: JSON.stringify({
        companyName: form.companyName,
        description: form.description,
        website: form.website,
        gstNumber: form.gstNumber,
        businessType: form.businessType,
        employeeCount: form.employeeCount,
        yearEstablished: form.yearEstablished ? parseInt(form.yearEstablished) : undefined,
        address: form.address,
        city: form.city,
        state: form.state,
        pincode: form.pincode,
        phone: form.phone,
        whatsapp: form.whatsapp,
        logo: form.logo,
      }),
    });
    setLoading(false);
    if (res) {
      showToast('Profile updated!', 'success');
      updateUser({ ...user!, vendor: res });
    } else {
      showToast(res?.error || 'Update failed', 'error');
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Vendor Profile</h1>
          <p className="text-gray-500 text-sm">Update your company information</p>
        </div>

        <div className="space-y-6">
          {/* Logo */}
          <div className="card flex items-center gap-6 p-4">
            <div className="w-20 h-20 rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0">
              {form.logo
                ? <img src={form.logo} alt="" className="w-full h-full object-cover" />
                : <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>
              }
            </div>
            <div>
              <p className="font-medium text-gray-900 mb-1">Company Logo</p>
              <p className="text-sm text-gray-500 mb-3">Recommended: 200×200px, PNG or JPG</p>
              <label className="btn-secondary text-sm cursor-pointer inline-block">
                {uploadingLogo ? 'Uploading...' : 'Upload Logo'}
                <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
              </label>
            </div>
          </div>

          {/* Account Info */}
          <div className="card p-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input name="name" value={form.name} onChange={handleChange} className="input" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input value={form.email} className="input bg-gray-50" disabled />
              </div>
            </div>
          </div>

          {/* Company Info */}
          <div className="card p-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Company Information</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                <input name="companyName" value={form.companyName} onChange={handleChange} className="input" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Company Description</label>
                <textarea name="description" value={form.description} onChange={handleChange} rows={3} className="input resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Business Type</label>
                  <select name="businessType" value={form.businessType} onChange={handleChange} className="input">
                    <option value="">Select type</option>
                    {BUSINESS_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Employees</label>
                  <select name="employeeCount" value={form.employeeCount} onChange={handleChange} className="input">
                    <option value="">Select range</option>
                    {EMPLOYEE_RANGES.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Year Established</label>
                  <input name="yearEstablished" type="number" value={form.yearEstablished} onChange={handleChange} className="input" placeholder="e.g. 2010" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">GST Number</label>
                  <input name="gstNumber" value={form.gstNumber} onChange={handleChange} className="input" placeholder="22AAAAA0000A1Z5" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                  <input name="website" value={form.website} onChange={handleChange} className="input" placeholder="https://..." />
                </div>
              </div>
            </div>
          </div>

          {/* Contact */}
          <div className="card p-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Contact Details</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input name="phone" value={form.phone} onChange={handleChange} className="input" placeholder="+91..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp</label>
                <input name="whatsapp" value={form.whatsapp} onChange={handleChange} className="input" placeholder="+91..." />
              </div>
            </div>
          </div>

          {/* Address */}
          <div className="card p-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Address</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Street Address</label>
                <input name="address" value={form.address} onChange={handleChange} className="input" />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                  <input name="city" value={form.city} onChange={handleChange} className="input" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                  <input name="state" value={form.state} onChange={handleChange} className="input" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Pincode</label>
                  <input name="pincode" value={form.pincode} onChange={handleChange} className="input" />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end pb-8">
            <button onClick={handleSubmit} disabled={loading} className="btn-primary px-8">
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
