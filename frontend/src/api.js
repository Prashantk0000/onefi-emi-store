const BASE = import.meta.env.VITE_API_BASE || '';

export async function fetchProducts() {
  const res = await fetch(`${BASE}/api/products`);
  if (!res.ok) throw new Error(`Failed to load products (${res.status})`);
  return res.json();
}

export async function fetchProduct(slug) {
  const res = await fetch(`${BASE}/api/products/${slug}`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Failed to load product (${res.status})`);
  return res.json();
}

export const inr = (n) =>
  '₹' + Number(n).toLocaleString('en-IN', { maximumFractionDigits: 0 });
