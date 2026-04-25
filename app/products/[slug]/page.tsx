import { redirect } from 'next/navigation';
export default function ProductSlugRedirect({ params }: any) {
  redirect(`/marketplace/products/${params.slug}`);
}
