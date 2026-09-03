import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchProducts, inr } from '../api.js';

export default function HomePage() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProducts()
      .then(setData)
      .catch((e) => setError(e.message));
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8">
      {/* Banner Section */}
      <div className="animate-fadeIn rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 sm:p-10 text-white shadow-lg relative overflow-hidden mb-10">
        <div className="absolute right-0 top-0 -mt-10 -mr-10 h-64 w-64 rounded-full bg-snaporange-500/20 blur-3xl" />
        <div className="relative z-10 max-w-2xl">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-snaporange-500/20 border border-snaporange-500/30 px-3 py-1 text-xs font-bold text-snaporange-400 mb-4">
            🔥 Zero Down Payment EMI
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Latest Smartphones on Easy Mutual-Fund EMIs
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-300">
            Get your flagship smartphone starting at ₹0 down payment with instant mutual-fund backed approval.
          </p>
        </div>
      </div>

      {/* Section Title */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Featured Smartphones on EMI</h2>
          <p className="text-xs text-slate-500">Explore top brands with 0% interest tenure options</p>
        </div>
        <span className="text-xs font-semibold text-snaporange-600 bg-snaporange-50 px-3 py-1 rounded-full border border-snaporange-200">
          3 Products Available
        </span>
      </div>

      {/* Error State */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 mb-8">
          {error} — is the backend running on :5000?
        </div>
      )}

      {/* Loading State */}
      {!data && !error && (
        <div className="py-20 flex justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-snaporange-500" />
        </div>
      )}

      {/* Product Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {(data?.products ?? []).map((p, i) => (
          <Link
            key={p.slug}
            to={`/products/${p.slug}`}
            className="group card-clean card-clean-hover overflow-hidden flex flex-col justify-between"
          >
            {/* Image Container with White Background */}
            <div className="relative aspect-square overflow-hidden bg-white p-6 flex items-center justify-center border-b border-slate-100">
              <span className="absolute top-3 left-3 bg-slate-900 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                {p.brand}
              </span>
              <span className="absolute top-3 right-3 badge-zero-orange">
                0% EMI
              </span>
              <img
                src={p.imageUrl}
                alt={`${p.name} ${p.variant}`}
                className="max-h-56 w-auto object-contain transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              />
            </div>

            {/* Content */}
            <div className="p-5 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 group-hover:text-snaporange-600 transition-colors line-clamp-1">
                  {p.name} ({p.variant})
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">{p.variant}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100">
                <div className="flex items-baseline gap-2">
                  <span className="text-xl font-black text-slate-900">{inr(p.price)}</span>
                  <span className="text-xs text-slate-400 line-through">MRP {inr(p.mrp)}</span>
                  <span className="text-xs font-bold text-emerald-600 ml-auto">
                    {Math.round(((p.mrp - p.price) / p.mrp) * 100)}% OFF
                  </span>
                </div>

                <div className="mt-3 flex items-center justify-between rounded-xl bg-orange-50/80 border border-orange-100 p-2.5">
                  <div>
                    <span className="block text-[10px] font-medium text-slate-500 uppercase tracking-wider">Starting EMI</span>
                    <span className="text-sm font-extrabold text-snaporange-600">{inr(p.emiStartsAt)}/mo</span>
                  </div>
                  <button className="bg-snaporange-500 text-white font-bold text-xs px-3 py-1.5 rounded-lg group-hover:bg-snaporange-600 transition-colors shadow-sm">
                    View Plans
                  </button>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {data && data.products.length === 0 && (
        <p className="py-12 text-center text-slate-500">No products found — please seed database.</p>
      )}

      {/* Trust Badges */}
      <div className="mt-16 rounded-2xl bg-white border border-slate-200 p-6 shadow-sm">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 text-center">
          <div className="p-3">
            <span className="text-2xl">⚡</span>
            <h4 className="text-xs font-bold text-slate-800 mt-1">Instant Approval</h4>
            <p className="text-[11px] text-slate-500">No paperwork needed</p>
          </div>
          <div className="p-3">
            <span className="text-2xl">🏷️</span>
            <h4 className="text-xs font-bold text-slate-800 mt-1">0% Interest</h4>
            <p className="text-[11px] text-slate-500">Select mutual fund plans</p>
          </div>
          <div className="p-3">
            <span className="text-2xl">🚚</span>
            <h4 className="text-xs font-bold text-slate-800 mt-1">Free Delivery</h4>
            <p className="text-[11px] text-slate-500">In 3-5 business days</p>
          </div>
          <div className="p-3">
            <span className="text-2xl">🛡️</span>
            <h4 className="text-xs font-bold text-slate-800 mt-1">100% Genuine</h4>
            <p className="text-[11px] text-slate-500">Official Brand Warranty</p>
          </div>
        </div>
      </div>
    </div>
  );
}
