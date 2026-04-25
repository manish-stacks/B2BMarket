import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Invalid Indian phone number'),
  password: z.string().min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/, 'Password must contain uppercase, lowercase, number, and special character'),
  role: z.enum(['BUYER', 'VENDOR']).default('BUYER'),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const productSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  price: z.number().min(0.01, 'Price must be greater than 0'),
  categoryId: z.string().min(1, 'Category is required'),
  minOrderQty: z.number().min(1).default(1),
  unit: z.string().default('piece'),
  stock: z.number().min(0).default(0),
  images: z.array(z.string()).min(1, 'At least one image is required'),
  specifications: z.record(z.string()).optional(),
  tags: z.array(z.string()).optional(),
});

export const inquirySchema = z.object({
  vendorId: z.string().min(1),
  productId: z.string().optional(),
  subject: z.string().min(5, 'Subject must be at least 5 characters'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
  quantity: z.number().min(1).optional(),
  unit: z.string().optional(),
});

export const vendorProfileSchema = z.object({
  companyName: z.string().min(2, 'Company name is required'),
  description: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  pincode: z.string().regex(/^\d{6}$/, 'Invalid pincode').optional(),
  gstNumber: z.string().regex(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, 'Invalid GST number').optional(),
  website: z.string().url('Invalid website URL').optional().or(z.literal('')),
});
