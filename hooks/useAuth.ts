'use client';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import axios from 'axios';

// Helper: set token cookie so Next.js middleware can read it
function setTokenCookie(token: string) {
  const maxAge = 60 * 60 * 24 * 7; // 7 days
  document.cookie = `token=${token}; path=/; max-age=${maxAge}; SameSite=Lax`;
}

function clearTokenCookie() {
  document.cookie = 'token=; path=/; max-age=0';
}

export function useAuth() {
  const { user, token, isAuthenticated, setAuth, logout } = useAuthStore();
  const router = useRouter();

  const login = async (email: string, password: string) => {
    const res = await axios.post('/api/auth/login', { email, password });
    const { user, token } = res.data.data;
    setAuth(user, token);
    setTokenCookie(token); // <-- cookie for middleware

    const redirectMap: Record<string, string> = {
      SUPER_ADMIN: '/dashboard/admin',
      SUB_ADMIN: '/dashboard/admin',
      VENDOR: '/dashboard/vendor',
      BUYER: '/dashboard/buyer',
    };
    router.push(redirectMap[user.role] || '/');
    return user;
  };

  const register = async (data: any) => {
    const res = await axios.post('/api/auth/register', data);
    const { user, token } = res.data.data;
    setAuth(user, token);
    setTokenCookie(token); // <-- cookie for middleware
    router.push(user.role === 'VENDOR' ? '/dashboard/vendor' : '/dashboard/buyer');
    return user;
  };

  const handleLogout = () => {
    logout();
    clearTokenCookie(); // <-- clear cookie on logout
    router.push('/');
  };

  return { user, token, isAuthenticated, login, register, logout: handleLogout };
}
