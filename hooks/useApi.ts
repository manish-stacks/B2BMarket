'use client';
import { useState, useCallback } from 'react';
import { useAuthStore } from '@/store/authStore';

interface RequestOptions {
  method?: string;
  body?: BodyInit | null;
  headers?: Record<string, string>;
}

export function useApi<T = any>() {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const token = useAuthStore((s) => s.token);

  // Accepts: request(url) or request(url, options)
  const request = useCallback(async (url: string, options: RequestOptions = {}) => {
    setLoading(true);
    setError(null);
    try {
      const headers: Record<string, string> = {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      };

      // Only set Content-Type for JSON bodies (not FormData)
      if (options.body && typeof options.body === 'string') {
        headers['Content-Type'] = 'application/json';
      }

      const res = await fetch(url, {
        method: options.method || 'GET',
        headers,
        body: options.body,
      });

      const json = await res.json();

      if (!res.ok) {
        const msg = json?.error || `Request failed (${res.status})`;
        setError(msg);
        return null;
      }

      // Handle both { data: ... } and flat response shapes
      const result = json?.data !== undefined ? json.data : json;
      setData(result);
      return result;
    } catch (err: any) {
      const msg = err.message || 'Network error';
      setError(msg);
      return null;
    } finally {
      setLoading(false);
    }
  }, [token]);

  return { data, loading, error, request };
}
