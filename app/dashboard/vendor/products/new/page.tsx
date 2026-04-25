'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useToast } from '@/components/ui/Toaster';
import { useApi } from '@/hooks/useApi';

const UNITS = ['Piece', 'Kg', 'Gram', 'Litre', 'Meter', 'Box', 'Set', 'Pair', 'Dozen', 'Quintal', 'Ton'];

export default function NewProductPage() {
  const router = useRouter();
  const { request } = useApi();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [images, setImages] = useState<string[]>([]);
  const [form, setForm] = useState({
    title: '', slug: '', description: '', price: '', minOrderQty: '1',
    unit: 'Piece', stock: '', categoryId: '', tags: '',
    specifications: [{ key: '', value: '' }],
  });

  useEffect(() => {
    request('/api/categories').then((res: any) => {
      if (res) setCategories(Array.isArray(res) ? res : res.categories || []);
    });
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (name === 'title') {
      setForm(prev => ({ ...prev, slug: value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') }));
    }
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
    if (images.length + files.length > 5) { showToast('Maximum 5 images', 'error'); return; }
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

  const handleSubmit = async (status: 'DRAFT' | 'ACTIVE') => {
    if (!form.title || !form.price || !form.categoryId) {
      showToast('Please fill required fields', 'error'); return;
    }
    setLoading(true);
    const specs: Record<string, string> = {};
    form.specifications.forEach(s => { if (s.key) specs[s.key] = s.value; });
    const res = await request('/api/products', {
      method: 'POST',
      body: JSON.stringify({
        title: form.title, slug: form.slug, description: form.description,
        price: parseFloat(form.price), minOrderQty: parseInt(form.minOrderQty),
        unit: form.unit, stock: form.stock ? parseInt(form.stock) : null,
        categoryId: form.categoryId,
        tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
        images, specifications: Object.keys(specs).length ? specs : undefined, status,
      }),
    });
    setLoading(false);
    if (res) {
      showToast('Product created!', 'success');
      router.push('/dashboard/vendor/products');
    } else {
      showToast('Failed to create product', 'error');
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/></svg>
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Add New Product</h1>
            <p className="text-gray-500 text-sm">Fill in details to list your product</p>
          </div>
        </div>
        <div className="space-y-6">
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Product Title <span className="text-red-500">*</span></label>
                <input name="title" value={form.title} onChange={handleChange} className="input" placeholder="e.g. Industrial Steel Pipes" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">URL Slug</label>
                <input name="slug" value={form.slug} onChange={handleChange} className="input bg-gray-50" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea name="description" value={form.description} onChange={handleChange} rows={4} className="input resize-none" placeholder="Describe your product..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category <span className="text-red-500">*</span></label>
                <select name="categoryId" value={form.categoryId} onChange={handleChange} className="input">
                  <option value="">Select category</option>
                  {categories.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Pricing & Stock</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹) <span className="text-red-500">*</span></label>
                <input name="price" type="number" value={form.price} onChange={handleChange} className="input" placeholder="0.00" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Min. Order Qty</label>
                <input name="minOrderQty" type="number" value={form.minOrderQty} onChange={handleChange} className="input" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                <select name="unit" value={form.unit} onChange={handleChange} className="input">
                  {UNITS.map(u => <option key={u}>{u}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
                <input name="stock" type="number" value={form.stock} onChange={handleChange} className="input" placeholder="Blank = unlimited" />
              </div>
            </div>
          </div>

          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Images <span className="text-gray-400 font-normal text-sm">(Max 5)</span></h2>
            <div className="flex flex-wrap gap-3">
              {images.map((img, i) => (
                <div key={i} className="relative w-24 h-24 rounded-lg overflow-hidden border border-gray-200">
                  <img src={img} alt="" className="w-full h-full object-cover" />
                  <button onClick={() => removeImage(i)} className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">×</button>
                </div>
              ))}
              {images.length < 5 && (
                <label className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-brand-500 transition-colors">
                  {uploadingImage ? <div className="w-5 h-5 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
                    : <><svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/></svg><span className="text-xs text-gray-400 mt-1">Upload</span></>}
                  <input type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" />
                </label>
              )}
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Specifications</h2>
              <button onClick={addSpec} className="text-brand-600 text-sm font-medium">+ Add Row</button>
            </div>
            <div className="space-y-3">
              {form.specifications.map((spec, i) => (
                <div key={i} className="flex gap-3">
                  <input value={spec.key} onChange={e => handleSpecChange(i, 'key', e.target.value)} className="input flex-1" placeholder="e.g. Material" />
                  <input value={spec.value} onChange={e => handleSpecChange(i, 'value', e.target.value)} className="input flex-1" placeholder="e.g. Steel" />
                  <button onClick={() => removeSpec(i)} className="text-gray-400 hover:text-red-500">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Tags</h2>
            <input name="tags" value={form.tags} onChange={handleChange} className="input" placeholder="e.g. steel, pipes, industrial (comma-separated)" />
          </div>

          <div className="flex gap-3 justify-end pb-8">
            <button onClick={() => handleSubmit('DRAFT')} disabled={loading} className="btn-secondary">Save as Draft</button>
            <button onClick={() => handleSubmit('ACTIVE')} disabled={loading} className="btn-primary">
              {loading ? 'Publishing...' : 'Publish Product'}
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
