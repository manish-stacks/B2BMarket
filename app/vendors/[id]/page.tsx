'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import ProductCard from '@/components/shared/ProductCard';
import InquiryModal from '@/components/shared/InquiryModal';
import Link from 'next/link';
import { formatDate } from '@/utils/helpers';

export default function VendorProfilePage() {
  const params = useParams();
  const [vendor, setVendor] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInquiry, setShowInquiry] = useState(false);

  useEffect(() => {
    const load = async () => {
      const [vendorRes, productsRes] = await Promise.all([
        fetch(`/api/vendors/${params.id}`).then(r => r.json()),
        fetch(`/api/products?vendorId=${params.id}&limit=12`).then(r => r.json()),
      ]);
      if (vendorRes?.data) setVendor(vendorRes.data);
      const prods = productsRes?.data?.products || productsRes?.data || [];
      setProducts(Array.isArray(prods) ? prods : []);
      setLoading(false);
    };
    if (params.id) load();
  }, [params.id]);

  if (loading) return (
    <>
      <Navbar />
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    </>
  );

  if (!vendor) return (
    <>
      <Navbar />
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-gray-900">Vendor not found</h2>
        <Link href="/marketplace" className="btn-primary inline-block mt-4">Browse Products</Link>
      </div>
    </>
  );

  return (
    <>
      <Navbar />
      <div className="bg-gray-50 min-h-screen">
        <div className="bg-white border-b border-gray-100">
          <div className="max-w-6xl mx-auto px-4 py-8">
            <div className="flex items-start gap-6 flex-wrap">
              <div className="w-20 h-20 rounded-2xl bg-gray-100 flex items-center justify-center flex-shrink-0 overflow-hidden shadow">
                {vendor.logo
                  ? <img src={vendor.logo} alt="" className="w-full h-full object-cover" />
                  : <span className="text-3xl">🏢</span>
                }
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between flex-wrap gap-4">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-1">{vendor.companyName}</h1>
                    <div className="flex items-center gap-3 flex-wrap text-sm text-gray-500">
                      {vendor.businessType && <span className="badge bg-brand-50 text-brand-600">{vendor.businessType}</span>}
                      {vendor.city && <span>📍 {vendor.city}{vendor.state ? `, ${vendor.state}` : ''}</span>}
                      {vendor.yearEstablished && <span>Est. {vendor.yearEstablished}</span>}
                      {vendor.employeeCount && <span>👥 {vendor.employeeCount} employees</span>}
                    </div>
                  </div>
                  <button onClick={() => setShowInquiry(true)} className="btn-primary">Send Inquiry</button>
                </div>
                {vendor.description && (
                  <p className="text-gray-600 mt-3 text-sm leading-relaxed max-w-2xl">{vendor.description}</p>
                )}
              </div>
            </div>
            <div className="flex gap-8 mt-6 pt-6 border-t border-gray-100 flex-wrap">
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">{products.length}</p>
                <p className="text-xs text-gray-400">Products</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">{vendor.totalViews?.toLocaleString() || 0}</p>
                <p className="text-xs text-gray-400">Views</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">{vendor.totalLeads || 0}</p>
                <p className="text-xs text-gray-400">Leads</p>
              </div>
              {vendor.gstNumber && (
                <div className="text-center">
                  <p className="text-sm font-bold text-gray-900">{vendor.gstNumber}</p>
                  <p className="text-xs text-gray-400">GST</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 py-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Products ({products.length})</h2>
          {products.length === 0 ? (
            <div className="text-center py-16 text-gray-400">No products listed yet</div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {products.map((product: any) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>

      {showInquiry && (
        <InquiryModal
          isOpen={showInquiry}
          vendorId={vendor.id}
          onClose={() => setShowInquiry(false)}
        />
      )}
    </>
  );
}
