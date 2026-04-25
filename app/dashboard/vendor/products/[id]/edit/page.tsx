'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useToast } from '@/components/ui/Toaster';
import { useApi } from '@/hooks/useApi';

const UNITS = ['Piece', 'Kg', 'Gram', 'Litre', 'Meter', 'Box', 'Set', 'Pair', 'Dozen', 'Quintal', 'Ton'];

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const { request } = useApi();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [images, setImages] = useState<string[]>([]);
  const [form, setForm] = useState({
    name: '', slug: '', description: '', price: '', minOrderQty: '1',
    unit: 'Piece', stock: '', categoryId: '', tags: '', status: 'ACTIVE',
    specifications: [{ key: '', value: '' }],
  });

  useEffect(() => {
    const load = async () => {
      const [catRes, prodRes] = await Promise.all([
        request('/api/categories'),
        request(`/api/products/${params.id}`),
      ]);
      if (catRes) setCategories(Array.isArray(catRes) ? catRes : (catRes.categories || []));
      if (prodRes) {
        const p = prodRes;
        const specs = p.specifications
          ? Object.entries(p.specifications).map(([key, value]) => ({ key, value: value as string }))
          : [{ key: '', value: '' }];
        setForm({
          name: p.name, slug: p.slug, description: p.description || '',
          price: String(p.price), minOrderQty: String(p.minOrderQty),
          unit: p.unit, stock: p.stock ? String(p.stock) : '',
          categoryId: p.categoryId, tags: (p.tags || []).join(', '),
          status: p.status, specifications: specs.length ? specs : [{ key: '', value: '' }],
        });
        setImages(p.images || []);
      }
      setFetching(false);
    };
    load();
  }, [params.id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSpecChange = (i: number, field: 'key' | 'value', value: string) => {
    setForm(prev => {
      const specs = [...prev.specifications];
      specs[i] = { ...specs[i], [field]: value };
      return { ...prev, specifications: specs };
    });
  };

  const addSpec = () => setForm(prev => ({ ...prev, specifications: [...prev.specifications, { key: '', value: '' }] }));
  const removeSpec = (i: number) => setForm(prev => ({ ...prev, specifications: prev.specifications.filter((_, idx) => idx !== i) }));

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    if (images.length + files.length > 5) { showToast('Maximum 5 images allowed', 'error'); return; }
    setUploadingImage(true);
    for (const file of files) {
      const fd = new FormData();
      fd.append('file', file);
      const res = await request('/api/upload', { method: 'POST', body: fd });
      if (res?.url) setImages(prev => [...prev, res.url]);
    }
    setUploadingImage(false);
  };

  const removeImage = (i: number) => setImages(prev => prev.filter((_, idx) => idx !== i));

  const handleSubmit = async () => {
    if (!form.name || !form.price || !form.categoryId) {
      showToast('Please fill required fields', 'error'); return;
    }
    setLoading(true);
    const specs: Record<string, string> = {};
    form.specifications.forEach(s => { if (s.key) specs[s.key] = s.value; });
    const res = await request(`/api/products/${params.id}`, {
      method: 'PUT',
      body: JSON.stringify({
        ...form,
        price: parseFloat(form.price),
        minOrderQty: parseInt(form.minOrderQty),
        stock: form.stock ? parseInt(form.stock) : null,
        tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
        images,
        specifications: Object.keys(specs).length ? specs : undefined,
      }),
    });
    setLoading(false);
    if (res) {
      showToast('Product updated!', 'success');
      router.push('/dashboard/vendor/products');
    } else {
      showToast(res?.error || 'Update failed', 'error');
    }
  };

  if (fetching) return (
    <DashboardLayout>
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/></svg>
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Edit Product</h1>
            <p className="text-gray-500 text-sm">Update your product details</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Product Name <span className="text-red-500">*</span></label>
                <input name="name" value={form.name} onChange={handleChange} className="input" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">URL Slug</label>
                <input name="slug" value={form.slug} onChange={handleChange} className="input bg-gray-50" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea name="description" value={form.description} onChange={handleChange} rows={4} className="input resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category <span className="text-red-500">*</span></label>
                  <select name="categoryId" value={form.categoryId} onChange={handleChange} className="input">
                    <option value="">Select category</option>
                    {categories.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select name="status" value={form.status} onChange={handleChange} className="input">
                    <option value="ACTIVE">Active</option>
                    <option value="DRAFT">Draft</option>
                    <option value="OUT_OF_STOCK">Out of Stock</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Pricing & Stock</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹) <span className="text-red-500">*</span></label>
                <input name="price" type="number" value={form.price} onChange={handleChange} className="input" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Min. Order Qty</label>
                <input name="minOrderQty" type="number" value={form.minOrderQty} onChange={handleChange} className="input" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                <select name="unit" value={form.unit} onChange={handleChange} className="input">
                  {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Stock Qty</label>
                <input name="stock" type="number" value={form.stock} onChange={handleChange} className="input" />
              </div>
            </div>
          </div>

          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Product Images</h2>
            <div className="flex flex-wrap gap-3">
              {images.map((img, i) => (
                <div key={i} className="relative w-24 h-24 rounded-lg overflow-hidden border border-gray-200">
                  <img src={img} alt="" className="w-full h-full object-cover" />
                  <button onClick={() => removeImage(i)} className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">×</button>
                </div>
              ))}
              {images.length < 5 && (
                <label className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-brand-500 transition-colors">
                  {uploadingImage
                    ? <div className="w-5 h-5 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
                    : <><svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/></svg><span className="text-xs text-gray-400 mt-1">Upload</span></>
                  }
                  <input type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" />
                </label>
              )}
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Specifications</h2>
              <button onClick={addSpec} className="text-brand-600 hover:text-brand-700 text-sm font-medium">+ Add Row</button>
            </div>
            <div className="space-y-3">
              {form.specifications.map((spec, i) => (
                <div key={i} className="flex gap-3">
                  <input value={spec.key} onChange={e => handleSpecChange(i, 'key', e.target.value)} className="input flex-1" placeholder="Key" />
                  <input value={spec.value} onChange={e => handleSpecChange(i, 'value', e.target.value)} className="input flex-1" placeholder="Value" />
                  <button onClick={() => removeSpec(i)} className="text-gray-400 hover:text-red-500 transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Tags</h2>
            <input name="tags" value={form.tags} onChange={handleChange} className="input" placeholder="comma-separated" />
          </div>

          <div className="flex gap-3 justify-end pb-8">
            <button onClick={() => router.back()} className="btn-secondary">Cancel</button>
            <button onClick={handleSubmit} disabled={loading} className="btn-primary">
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
