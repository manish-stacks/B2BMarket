'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import axios from 'axios';
import Navbar from '@/components/layout/Navbar';
import InquiryModal from '@/components/shared/InquiryModal';
import { MapPin, Shield, Star, Heart, MessageSquare, Share2, ChevronRight, Package, ShieldCheck, Phone } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { formatCurrency } from '@/utils/helpers';

export default function ProductDetailPage() {
  const { slug } = useParams();
  const router = useRouter();
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);

  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [inquiryOpen, setInquiryOpen] = useState(false);

  useEffect(() => {
    axios.get(`/api/products/${slug}`).then((r) => {
      setProduct(r.data.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [slug]);

  if (loading) return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-8 animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="aspect-square bg-gray-200 rounded-xl" />
          <div className="space-y-4">
            <div className="h-8 bg-gray-200 rounded w-3/4" />
            <div className="h-6 bg-gray-200 rounded w-1/3" />
            <div className="h-24 bg-gray-200 rounded" />
          </div>
        </div>
      </div>
    </div>
  );

  if (!product) return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold text-gray-700">Product not found</h2>
        <Link href="/marketplace" className="btn-primary mt-4 inline-block">Back to Marketplace</Link>
      </div>
    </div>
  );

  const images = Array.isArray(product.images) ? product.images : [product.images];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1 text-sm text-gray-500 mb-6">
          <Link href="/" className="hover:text-brand-600">Home</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <Link href="/marketplace" className="hover:text-brand-600">Marketplace</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          {product.category && <><Link href={`/marketplace?categoryId=${product.category.id}`} className="hover:text-brand-600">{product.category.name}</Link><ChevronRight className="h-3.5 w-3.5" /></>}
          <span className="text-gray-700 truncate max-w-xs">{product.title}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Images + Details */}
          <div className="lg:col-span-2 space-y-4">
            <div className="card overflow-hidden">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-0">
                {/* Thumbnails */}
                <div className="md:col-span-1 flex md:flex-col gap-2 p-3 overflow-x-auto md:overflow-y-auto">
                  {images.map((img: string, i: number) => (
                    <button key={i} onClick={() => setSelectedImage(i)}
                      className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 ${selectedImage === i ? 'border-brand-500' : 'border-gray-200'}`}>
                      <Image src={img} alt="" width={64} height={64} className="object-cover w-full h-full" />
                    </button>
                  ))}
                </div>
                {/* Main image */}
                <div className="md:col-span-4 relative aspect-square md:aspect-[4/3] bg-gray-50">
                  <Image src={images[selectedImage] || images[0]} alt={product.title} fill className="object-contain p-4" sizes="(max-width: 768px) 100vw, 60vw" />
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="card p-6">
              <h2 className="font-bold text-gray-900 mb-3">Product Description</h2>
              <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">{product.description}</p>
            </div>

            {/* Specs */}
            {product.specifications && Object.keys(product.specifications).length > 0 && (
              <div className="card p-6">
                <h2 className="font-bold text-gray-900 mb-3">Specifications</h2>
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(product.specifications).map(([k, v]: [string, any]) => (
                    <div key={k} className="flex justify-between py-2 border-b border-gray-50">
                      <span className="text-sm text-gray-500">{k}</span>
                      <span className="text-sm font-medium text-gray-700">{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right panel */}
          <div className="space-y-4">
            <div className="card p-5">
              <h1 className="text-xl font-bold text-gray-900 font-display leading-snug">{product.title}</h1>
              <div className="flex items-baseline gap-2 mt-3">
                <span className="text-3xl font-bold text-brand-600">{formatCurrency(product.price)}</span>
                <span className="text-sm text-gray-400">/{product.unit}</span>
              </div>
              {product.minOrderQty > 1 && (
                <p className="text-sm text-gray-500 mt-1">Min. Order: {product.minOrderQty} {product.unit}</p>
              )}
              <div className="flex items-center gap-2 mt-4 text-sm text-gray-500">
                <Package className="h-4 w-4" />
                <span>{product.stock > 0 ? `${product.stock} in stock` : 'Available on request'}</span>
              </div>
              <div className="flex gap-2 mt-4">
                <button onClick={() => { if (!token) { router.push('/auth/login'); return; } setInquiryOpen(true); }}
                  className="btn-primary flex-1">
                  <MessageSquare className="h-4 w-4" /> Send Inquiry
                </button>
                <button className="btn-secondary px-3"><Heart className="h-4 w-4" /></button>
                <button className="btn-secondary px-3"><Share2 className="h-4 w-4" /></button>
              </div>
            </div>

            {/* Vendor card */}
            {product.vendor && (
              <div className="card p-5">
                <h3 className="font-bold text-gray-900 mb-4 text-sm uppercase tracking-wide">Supplier Details</h3>
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 bg-brand-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="text-brand-700 font-bold text-lg">{product.vendor.companyName[0]}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1">
                      <p className="font-bold text-gray-900">{product.vendor.companyName}</p>
                      {product.vendor.isVerified && <ShieldCheck className="h-4 w-4 text-green-500 flex-shrink-0" />}
                    </div>
                    {product.vendor.city && (
                      <p className="text-sm text-gray-500 flex items-center gap-1 mt-0.5">
                        <MapPin className="h-3.5 w-3.5" /> {product.vendor.city}, {product.vendor.state}
                      </p>
                    )}
                    <div className="flex items-center gap-1 mt-1">
                      <Star className="h-3.5 w-3.5 text-yellow-500 fill-current" />
                      <span className="text-sm font-medium">{product.vendor.rating?.toFixed(1) || '4.5'}</span>
                      <span className="text-sm text-gray-400">({product.vendor.reviewCount || 0} reviews)</span>
                    </div>
                  </div>
                </div>
                <Link href={`/vendors/${product.vendor.id}`} className="btn-secondary w-full mt-4 text-sm flex items-center justify-center gap-2">
                  View Supplier Profile
                </Link>
              </div>
            )}

            <div className="card p-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Shield className="h-4 w-4 text-green-500" />
                <span>Verified supplier with GST registration</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <InquiryModal
        isOpen={inquiryOpen}
        onClose={() => setInquiryOpen(false)}
        vendorId={product?.vendor?.id}
        productId={product?.id}
        productTitle={product?.title}
      />
    </div>
  );
}
