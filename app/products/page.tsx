import { redirect } from 'next/navigation';
export default function ProductsPage({ searchParams }: any) {
  const params = new URLSearchParams(searchParams);
  redirect(`/marketplace?${params.toString()}`);
}
