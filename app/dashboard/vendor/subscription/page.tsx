'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useApi } from '@/hooks/useApi';
import { useToast } from '@/components/ui/Toaster';
import { formatCurrency } from '@/utils/helpers';

declare global { interface Window { Razorpay: any; } }

const FEATURES: Record<string, string[]> = {
  FREE: ['Up to 5 products', 'Basic inquiries', 'Email support'],
  BASIC: ['Up to 25 products', 'Priority inquiries', 'Analytics dashboard', 'Email + chat support'],
  PREMIUM: ['Unlimited products', 'Featured listings', 'Advanced analytics', 'Dedicated account manager', 'API access'],
};

const BADGE_COLORS: Record<string, string> = {
  FREE: 'bg-gray-100 text-gray-700',
  BASIC: 'bg-blue-100 text-blue-700',
  PREMIUM: 'bg-brand-100 text-brand-700',
};

export default function VendorSubscriptionPage() {
  const { request } = useApi();
  const { showToast } = useToast();
  const [plans, setPlans] = useState<any[]>([]);
  const [current, setCurrent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const res = await request('/api/subscriptions');
      if (res) {
        const plansObj = res.plans || {};
        const plansArr = Object.entries(plansObj).map(([name, data]: any) => ({
          id: name, name, ...data,
          billingCycle: data.duration >= 365 ? 'YEAR' : 'MONTH',
        }));
        setPlans(plansArr);
        setCurrent(res.current || null);
      }
      setLoading(false);
    };
    load();
  }, []);

  const handleSubscribe = async (plan: any) => {
    if (plan.price === 0) return;
    setPaying(plan.id);
    const res = await request('/api/subscriptions', {
      method: 'POST',
      body: JSON.stringify({ plan: plan.id }),
    });
    setPaying(null);

    if (res?.order?.id) {
      // Load Razorpay
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      document.body.appendChild(script);
      script.onload = () => {
        const rz = new window.Razorpay({
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
          amount: plan.price * 100,
          currency: 'INR',
          name: 'B2B Marketplace',
          description: `${plan.name} Plan - ${plan.billingCycle}`,
          order_id: res.order.id,
          handler: async (response: any) => {
            const verifyRes = await request('/api/subscriptions/verify', {
              method: 'POST',
              body: JSON.stringify({ ...response, planId: plan.id }),
            });
            if (verifyRes?.data) {
              showToast('Subscription activated!', 'success');
              setCurrent(plan);
            } else {
              showToast('Payment verification failed', 'error');
            }
          },
          theme: { color: '#f97316' },
        });
        rz.open();
      };
    } else {
      showToast('Failed to initiate payment', 'error');
    }
  };

  if (loading) return (
    <DashboardLayout>
      <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" /></div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout>
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Choose Your Plan</h1>
        <p className="text-gray-500">Upgrade to unlock more features and grow your business</p>
      </div>

      {current && (
        <div className="card mb-8 bg-brand-50 border border-brand-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-brand-600 font-medium">Current Plan</p>
              <p className="text-xl font-bold text-brand-800 mt-1">{current.name}</p>
              {current.expiresAt && (
                <p className="text-sm text-brand-600 mt-1">
                  Expires: {new Date(current.expiresAt).toLocaleDateString()}
                </p>
              )}
            </div>
            <div className="w-12 h-12 bg-brand-500 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/></svg>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan: any) => {
          const isCurrentPlan = current?.id === plan.id || current?.name === plan.name;
          const features = FEATURES[plan.name] || [];
          const isPremium = plan.name === 'PREMIUM';

          return (
            <div key={plan.id} className={`card relative flex flex-col p-4 ${isPremium ? 'border-brand-300 shadow-brand-100 shadow-lg ring-1 ring-brand-200' : ''}`}>
              {isPremium && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-brand-500 text-white text-xs font-semibold px-3 py-1 rounded-full">Most Popular</span>
                </div>
              )}
              <div className="mb-6">
                <span className={`badge ${BADGE_COLORS[plan.name] || 'bg-gray-100 text-gray-700'} mb-3`}>{plan.name}</span>
                <div className="flex items-end gap-1">
                  <span className="text-3xl font-bold text-gray-900">{plan.price === 0 ? 'Free' : formatCurrency(plan.price)}</span>
                  {plan.price > 0 && <span className="text-gray-400 text-sm mb-1">/{plan.billingCycle?.toLowerCase()}</span>}
                </div>
              </div>

              <ul className="space-y-3 flex-1 mb-6">
                {features.map((f, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-gray-600">
                    <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/></svg>
                    {f}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => !isCurrentPlan && handleSubscribe(plan)}
                disabled={isCurrentPlan || paying === plan.id}
                className={`w-full py-3 rounded-xl font-semibold text-sm transition-all ${
                  isCurrentPlan
                    ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                    : isPremium
                    ? 'bg-brand-500 text-white hover:bg-brand-600'
                    : 'bg-gray-900 text-white hover:bg-gray-800'
                }`}>
                {paying === plan.id ? 'Processing...' : isCurrentPlan ? 'Current Plan' : plan.price === 0 ? 'Get Started' : `Upgrade to ${plan.name}`}
              </button>
            </div>
          );
        })}
      </div>

      <div className="mt-8 p-4 bg-gray-50 rounded-xl text-center text-sm text-gray-500">
        All plans include SSL security, 99.9% uptime, and GDPR compliance. Cancel anytime.
      </div>
    </DashboardLayout>
  );
}
