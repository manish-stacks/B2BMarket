import { UserRole, UserStatus, VendorStatus, ProductStatus, InquiryStatus, SubscriptionPlan } from '@prisma/client';

export interface AuthUser {
  userId: string;
  email: string;
  role: UserRole;
  name?: string;
}

export interface ProductFilters {
  search?: string;
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  vendorId?: string;
  status?: ProductStatus;
  page?: number;
  limit?: number;
  sortBy?: 'price_asc' | 'price_desc' | 'newest' | 'popular';
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  meta?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface DashboardStats {
  totalUsers?: number;
  totalVendors?: number;
  totalProducts?: number;
  totalInquiries?: number;
  pendingVendors?: number;
  revenue?: number;
}

export type { UserRole, UserStatus, VendorStatus, ProductStatus, InquiryStatus, SubscriptionPlan };
