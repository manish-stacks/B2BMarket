'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import { MapPin, Package, Shield, Search } from 'lucide-react';

export default function VendorsPage() {
  const [vendors, setVendors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch('/api/vendors?limit=50')
      .then(r => r.json())
      .then(d => {
        const list = d.data?.vendors || d.data || [];
        setVendors(Array.isArray(list) ? list : []);
        setLoading(false);
      }).catch(() => setLoading(false));
  }, []);

  const filtered = vendors.filter(v =>
    v.companyName?.toLowerCase().includes(search.toLowerCase()) ||
    v.city?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Verified Suppliers</h1>
            <p className="text-gray-500 text-sm">{filtered.length} suppliers found</p>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              className="input pl-9 w-64" placeholder="Search suppliers..." />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" /></div>
        ) : filtered.length === 0 ? (
          <div className="card text-center py-20 text-gray-400">No suppliers found</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((v: any) => (
              <Link key={v.id} href={`/vendors/${v.id}`} className="card hover:shadow-md transition-shadow group">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {v.logo ? <img src={v.logo} alt="" className="w-full h-full object-cover" /> : <span className="text-2xl">🏢</span>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-900 group-hover:text-brand-600 transition-colors truncate">{v.companyName}</h3>
                      {v.isVerified && <Shield className="h-4 w-4 text-green-500 flex-shrink-0" />}
                    </div>
                    {v.businessType && <span className="badge bg-brand-50 text-brand-600 text-xs mt-1">{v.businessType}</span>}
                    <div className="flex gap-3 mt-2 text-xs text-gray-500 flex-wrap">
                      {v.city && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{v.city}</span>}
                      {v.totalProducts > 0 && <span className="flex items-center gap-1"><Package className="h-3 w-3" />{v.totalProducts} products</span>}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
