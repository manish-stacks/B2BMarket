'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import ProductCard from '@/components/shared/ProductCard';
import { Search, ArrowRight, Shield, Zap, CheckCircle, Star, Users, Package, TrendingUp } from 'lucide-react';

const STATS = [
  { label: 'Verified Suppliers', value: '5 Lakh+', icon: Shield },
  { label: 'Products Listed', value: '2 Crore+', icon: Package },
  { label: 'Monthly Buyers', value: '60 Lakh+', icon: Users },
  { label: 'Business Enquiries', value: '5 Crore+', icon: TrendingUp },
];

export default function HomePage() {
  const [search, setSearch] = useState('');
  const [categories, setCategories] = useState<any[]>([]);
  const [sections, setSections] = useState<{ cat: any; products: any[] }[]>([]);
  const [loadingSections, setLoadingSections] = useState(true);

  useEffect(() => {
    // Load categories first
    fetch('/api/categories')
      .then(r => r.json())
      .then(async d => {
        const cats: any[] = Array.isArray(d.data) ? d.data : [];
        setCategories(cats);

        // For each category, fetch products
        const results: { cat: any; products: any[] }[] = [];
        for (const cat of cats.slice(0, 8)) {
          try {
            const pr = await fetch(`/api/products?categoryId=${cat.id}&limit=5&sortBy=popular`);
            const pd = await pr.json();
            const prods: any[] = pd.data?.products || (Array.isArray(pd.data) ? pd.data : []);
            if (prods.length > 0) results.push({ cat, products: prods });
          } catch {}
        }
        setSections(results);
        setLoadingSections(false);
      })
      .catch(() => setLoadingSections(false));
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) window.location.href = `/marketplace?search=${encodeURIComponent(search.trim())}`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Hero */}
      <section className="bg-gradient-to-br from-navy-900 via-navy-800 to-brand-800 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 right-10 w-64 h-64 bg-brand-400 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-20 w-96 h-96 bg-blue-500 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 py-16 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 text-sm mb-5">
            <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
            India's #1 B2B Marketplace
          </div>
          <h1 className="text-4xl md:text-5xl font-bold font-display mb-4 leading-tight">
            Connect with <span className="text-brand-400">Verified</span> Suppliers<br className="hidden md:block" /> & Grow Your Business
          </h1>
          <p className="text-lg text-white/70 mb-8 max-w-xl mx-auto">
            Find suppliers, compare prices, place bulk orders securely.
          </p>
          <form onSubmit={handleSearch} className="flex gap-2 max-w-2xl mx-auto mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search products, suppliers, categories..."
                className="w-full pl-10 pr-4 py-3.5 rounded-xl text-gray-900 border-0 focus:ring-2 focus:ring-brand-400 outline-none text-sm"
              />
            </div>
            <button type="submit" className="bg-brand-500 hover:bg-brand-400 text-white px-8 py-3.5 rounded-xl font-semibold transition-all text-sm whitespace-nowrap">
              Search
            </button>
          </form>
          <div className="flex flex-wrap gap-2 justify-center text-sm text-white/60">
            <span>Popular:</span>
            {['Steel', 'Machinery', 'Electronics', 'Chemicals', 'Textiles'].map(t => (
              <a key={t} href={`/marketplace?search=${t}`} className="hover:text-white transition-colors">{t}</a>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {STATS.map(({ label, value, icon: Icon }) => (
              <div key={label} className="text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Icon className="h-4 w-4 text-brand-600" />
                  <span className="text-xl font-bold text-gray-900">{value}</span>
                </div>
                <p className="text-xs text-gray-500">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      {categories.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-bold text-gray-900">Browse by Category</h2>
            <Link href="/marketplace" className="text-brand-600 hover:text-brand-700 text-sm font-medium flex items-center gap-1">
              All Categories <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-3">
            {categories.map((cat: any) => (
              <Link key={cat.id} href={`/marketplace?categoryId=${cat.id}`}
                className="bg-white rounded-xl p-3 text-center hover:shadow-md hover:border-brand-200 border-2 border-transparent transition-all group cursor-pointer">
                <div className="text-2xl mb-1.5">{cat.icon || '📦'}</div>
                <p className="text-xs font-semibold text-gray-800 group-hover:text-brand-600 leading-tight line-clamp-2">{cat.name}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* IndiaMART-style: category sections with products */}
      {loadingSections && (
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
          </div>
        </div>
      )}

      {sections.map(({ cat, products }) => (
        <section key={cat.id} className="bg-white border-t border-gray-100 py-8">
          <div className="max-w-7xl mx-auto px-4">
            {/* Section header */}
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{cat.icon || '📦'}</span>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">{cat.name}</h2>
                  <p className="text-xs text-gray-400">Top products in this category</p>
                </div>
              </div>
              <Link href={`/marketplace?categoryId=${cat.id}`}
                className="flex items-center gap-1.5 text-sm font-semibold text-brand-600 hover:text-brand-700 bg-brand-50 hover:bg-brand-100 px-4 py-2 rounded-lg transition-all">
                View All <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {/* Product grid — IndiaMART style: 1 featured + 4 regular */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {products.slice(0, 5).map((product: any, i: number) => (
                <div key={product.id} className={i === 0 ? 'md:row-span-1' : ''}>
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          </div>
        </section>
      ))}

      {/* No products yet fallback */}
      {!loadingSections && sections.length === 0 && (
        <section className="max-w-7xl mx-auto px-4 py-12 text-center">
          <p className="text-gray-400 text-sm">No products listed yet. <Link href="/auth/register?role=VENDOR" className="text-brand-600 hover:underline">Be the first vendor!</Link></p>
        </section>
      )}

      {/* Why Us */}
      <section className="bg-gray-50 border-t border-gray-100 py-10">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-xl font-bold text-gray-900 text-center mb-8">Why Choose B2B Marketplace?</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: Shield, title: 'Verified Suppliers', desc: 'All suppliers verified with GST and business documents for safe trading.', color: 'green' },
              { icon: Zap, title: 'Quick Response', desc: 'Get quotes from multiple suppliers within hours using our smart inquiry system.', color: 'yellow' },
              { icon: CheckCircle, title: 'Secure Payments', desc: 'Safe payments via Razorpay with buyer protection on every transaction.', color: 'blue' },
            ].map(({ icon: Icon, title, desc, color }) => (
              <div key={title} className="text-center p-6 bg-white rounded-2xl shadow-sm">
                <div className={`w-12 h-12 bg-${color}-100 rounded-xl flex items-center justify-center mx-auto mb-3`}>
                  <Icon className={`h-6 w-6 text-${color}-600`} />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{title}</h3>
                <p className="text-gray-500 text-sm">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Vendor CTA */}
      <section className="bg-gradient-to-r from-brand-600 to-brand-700 text-white py-12">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-3">Start Selling to Millions of Buyers</h2>
          <p className="text-white/80 mb-6">Register free and reach 60 lakh+ monthly buyers across India.</p>
          <Link href="/auth/register?role=VENDOR"
            className="bg-white text-brand-700 hover:bg-gray-50 px-10 py-3.5 rounded-xl font-bold inline-block shadow-lg transition-all">
            Register as Vendor — Free!
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-navy-900 text-white py-10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">B2</span>
                </div>
                <span className="text-xl font-bold">B2BMarket</span>
              </div>
              <p className="text-white/60 text-sm">India's trusted B2B marketplace connecting buyers and sellers.</p>
            </div>
            {[
              { title: 'For Buyers', links: [['Browse Products', '/marketplace'], ['Search Suppliers', '/vendors'], ['My Inquiries', '/dashboard/buyer/inquiries']] },
              { title: 'For Sellers', links: [['List Products', '/dashboard/vendor/products/new'], ['Manage Leads', '/dashboard/vendor/inquiries'], ['Subscription Plans', '/dashboard/vendor/subscription']] },
              { title: 'Company', links: [['About Us', '#'], ['Contact', '#'], ['Privacy Policy', '#'], ['Terms of Service', '#']] },
            ].map(({ title, links }) => (
              <div key={title}>
                <h4 className="font-semibold mb-3 text-sm">{title}</h4>
                <ul className="space-y-2">
                  {links.map(([l, href]) => <li key={l}><Link href={href} className="text-white/60 hover:text-white text-sm transition-colors">{l}</Link></li>)}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-white/10 pt-6 text-center text-white/40 text-sm">
            © {new Date().getFullYear()} B2B Marketplace. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
