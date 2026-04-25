import { NextRequest } from 'next/server';
import { withAuth, apiResponse, apiError } from '@/lib/middleware';
import { uploadImage } from '@/lib/cloudinary';
import { AuthenticatedRequest } from '@/lib/middleware';

export const POST = withAuth(async (req: AuthenticatedRequest) => {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const folder = formData.get('folder') as string || 'products';

    if (!file) return apiError('No file provided', 400);

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) return apiError('File size exceeds 5MB', 400);

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) return apiError('Only JPEG, PNG and WebP allowed', 400);

    const buffer = await file.arrayBuffer();
    const base64 = `data:${file.type};base64,${Buffer.from(buffer).toString('base64')}`;

    const result = await uploadImage(base64, `b2b-marketplace/${folder}`);
    return apiResponse(result);
  } catch (err) {
    console.error('Upload error:', err);
    return apiError('Upload failed', 500);
  }
});
