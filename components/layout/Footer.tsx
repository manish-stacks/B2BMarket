// components/layout/Footer.tsx
import Link from 'next/link';
import { Building2, Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#1d3557] text-gray-300">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 bg-red-600 rounded-lg flex items-center justify-center">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <span className="font-poppins font-bold text-xl text-white">IndiaB2B</span>
            </div>
            <p className="text-sm leading-relaxed mb-4">
              India's #1 B2B Marketplace connecting buyers with verified suppliers, manufacturers, and exporters nationwide.
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-red-400" />
                <span>support@indiab2b.com</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-red-400" />
                <span>1800-123-4567 (Toll Free)</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-red-400" />
                <span>New Delhi, India</span>
              </div>
            </div>
          </div>

          {/* For Buyers */}
          <div>
            <h4 className="font-poppins font-semibold text-white mb-4">For Buyers</h4>
            <ul className="space-y-2 text-sm">
              {[
                { label: 'Browse Products', href: '/products' },
                { label: 'Find Suppliers', href: '/vendors' },
                { label: 'Browse Categories', href: '/categories' },
                { label: 'Post Buy Requirement', href: '/buyer/post-requirement' },
                { label: 'My Inquiries', href: '/buyer/inquiries' },
              ].map(({ label, href }) => (
                <li key={href}>
                  <Link href={href} className="hover:text-red-400 transition-colors">{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* For Suppliers */}
          <div>
            <h4 className="font-poppins font-semibold text-white mb-4">For Suppliers</h4>
            <ul className="space-y-2 text-sm">
              {[
                { label: 'Sell on IndiaB2B', href: '/auth/register?role=VENDOR' },
                { label: 'Vendor Dashboard', href: '/vendor/dashboard' },
                { label: 'Subscription Plans', href: '/vendor/subscription' },
                { label: 'Manage Products', href: '/vendor/products' },
                { label: 'View Inquiries', href: '/vendor/inquiries' },
              ].map(({ label, href }) => (
                <li key={href}>
                  <Link href={href} className="hover:text-red-400 transition-colors">{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-poppins font-semibold text-white mb-4">Company</h4>
            <ul className="space-y-2 text-sm">
              {[
                { label: 'About Us', href: '/pages/about-us' },
                { label: 'Privacy Policy', href: '/pages/privacy-policy' },
                { label: 'Terms of Service', href: '/pages/terms-of-service' },
                { label: 'Contact Us', href: '/contact' },
                { label: 'Help & Support', href: '/support' },
              ].map(({ label, href }) => (
                <li key={href}>
                  <Link href={href} className="hover:text-red-400 transition-colors">{label}</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col sm:flex-row justify-between items-center gap-2 text-sm text-gray-500">
          <p>© 2024 IndiaB2B. All rights reserved.</p>
          <p>Made with ❤️ in India</p>
        </div>
      </div>
    </footer>
  );
}
