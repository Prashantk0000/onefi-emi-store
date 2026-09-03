import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { fetchProduct, inr } from '../api.js';

export default function ProductPage() {
  const { slug } = useParams();
  const [product, setProduct] = useState(undefined); // undefined = loading, null = 404
  const [error, setError] = useState(null);
  const [variantId, setVariantId] = useState(null);
  const [planId, setPlanId] = useState(null);
  const [ordered, setOrdered] = useState(false);
  const [activeTabImage, setActiveTabImage] = useState(0);

  useEffect(() => {
    setProduct(undefined);
    setOrdered(false);
    setActiveTabImage(0);
    fetchProduct(slug)
      .then((p) => {
        setProduct(p);
        if (p) {
          const def = p.variants.find((v) => v.isDefault) ?? p.variants[0];
          setVariantId(def.id);
          setPlanId(def.emiPlans[0]?.id ?? null);
        }
      })
      .catch((e) => setError(e.message));
  }, [slug]);

  const variant = useMemo(
    () => product?.variants.find((v) => v.id === variantId),
    [product, variantId]
  );
  const plan = useMemo(
    () => variant?.emiPlans.find((p) => p.id === planId),
    [variant, planId]
  );

  const selectVariant = (id) => {
    setVariantId(id);
    const v = product.variants.find((x) => x.id === id);
    setPlanId(v.emiPlans[0]?.id ?? null);
    setOrdered(false);
  };

  if (error)
    return (
      <Center>
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
          <p className="font-bold text-red-600">{error}</p>
          <p className="text-xs text-red-500 mt-1">Is the backend server running on port 5000?</p>
        </div>
      </Center>
    );
  if (product === undefined) return <Center><Spinner /></Center>;
  if (product === null)
    return (
      <Center>
        <div className="rounded-2xl bg-white border border-slate-200 p-8 text-center shadow-sm">
          <p className="text-4xl">😕</p>
          <h1 className="mt-4 text-xl font-bold text-slate-800">Product not found</h1>
          <p className="mt-1 text-sm text-slate-500">No product matches "{slug}".</p>
          <Link to="/" className="mt-4 inline-block btn-blue px-5 py-2 text-sm">
            Browse all products
          </Link>
        </div>
      </Center>
    );

  const discount = Math.round(((variant.mrp - variant.price) / variant.mrp) * 100);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6 animate-fadeIn">
      {/* Breadcrumb matching reference image */}
      <nav className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500 mb-6">
        <Link to="/" className="hover:text-snaporange-600">Shop on EMI</Link>
        <span>›</span>
        <Link to="/" className="hover:text-snaporange-600">Smart Phones</Link>
        <span>›</span>
        <span className="hover:text-snaporange-600">{product.brand}</span>
        <span>›</span>
        <span className="text-slate-800 font-semibold truncate">{product.name} ({variant.name})</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-12 items-start">
        {/* ================= LEFT COLUMN: THUMBNAILS & MAIN IMAGE & VARIANT SELECTOR ================= */}
        <div className="lg:col-span-6 flex flex-col gap-6">
          <div className="flex gap-4 items-start">
            {/* Thumbnails Sidebar */}
            <div className="flex flex-col gap-2 shrink-0">
              {[0, 1, 2].map((idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveTabImage(idx)}
                  className={`h-16 w-16 rounded-xl border-2 p-1 bg-white overflow-hidden transition-all ${
                    activeTabImage === idx ? 'border-snaporange-500 ring-2 ring-snaporange-500/20' : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <img
                    src={variant.imageUrl}
                    alt="Thumbnail"
                    className="h-full w-full object-contain"
                  />
                </button>
              ))}
            </div>

            {/* Main Product Display Card */}
            <div className="flex-1 bg-white border border-slate-200 rounded-2xl p-6 relative flex items-center justify-center min-h-[380px] shadow-sm">
              <span className="absolute top-4 right-4 bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                4.2 ★
              </span>
              <img
                key={variant.imageUrl}
                src={variant.imageUrl}
                alt={`${product.name} — ${variant.name}`}
                className="max-h-[350px] w-auto object-contain transition-all duration-300"
              />
            </div>
          </div>

          {/* Variant Selector Dropdowns / Buttons (Color & Storage) */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              Select Variant & Color
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Color</label>
                <select
                  value={variantId}
                  onChange={(e) => selectVariant(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm font-semibold text-slate-800 focus:outline-none focus:border-snaporange-500"
                >
                  {product.variants.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.color} ({v.storage})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Storage & Finish</label>
                <div className="bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 text-sm font-medium text-slate-700">
                  {variant.storage} • {variant.finish}
                </div>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {product.variants.map((v) => (
                <button
                  key={v.id}
                  onClick={() => selectVariant(v.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                    v.id === variantId
                      ? 'bg-snaporange-50 border-snaporange-500 text-snaporange-600 shadow-sm'
                      : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  {v.color} ({v.storage})
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ================= RIGHT COLUMN: PRODUCT INFO & EMI SELECTION CARD ================= */}
        <div className="lg:col-span-6 flex flex-col gap-5">
          {/* Title & Price Header */}
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {product.name} ({variant.name})
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-slate-500 font-medium">
                (Storage: {variant.storage}, Color: {variant.color})
              </span>
              <span className="text-xs font-bold text-snaporange-600 bg-orange-50 px-2 py-0.5 rounded">
                🔥 70+ sold
              </span>
            </div>

            <div className="mt-4 flex items-baseline gap-3">
              <span className="text-3xl font-black text-slate-900">{inr(variant.price)}</span>
              {variant.mrp > variant.price && (
                <>
                  <span className="text-sm text-slate-400 line-through">MRP {inr(variant.mrp)}</span>
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    {discount}% OFF
                  </span>
                </>
              )}
            </div>
          </div>

          {/* ================= MAIN EMI PLAN SELECTION CARD (Matching Snapmint Screenshot) ================= */}
          <div className="bg-white border-2 border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            {/* Pay Now Banner */}
            {plan && (
              <div className="bg-orange-50/80 border-b border-orange-100 px-5 py-3 flex items-center gap-2 text-snaporange-700 font-bold text-sm">
                <span>🛒</span>
                <span>Pay only <strong className="text-snaporange-600 text-base">{inr(plan.monthlyPayment)}</strong> now</span>
              </div>
            )}

            <div className="p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-extrabold text-slate-900 text-base">Choose EMI Tenure</h3>
                <span className="text-[11px] text-slate-400 font-medium">EMIs backed by Mutual Funds</span>
              </div>

              {/* Radio Plan List */}
              <div className="space-y-3">
                {variant.emiPlans.map((p) => {
                  const isSelected = p.id === planId;
                  return (
                    <div
                      key={p.id}
                      onClick={() => { setPlanId(p.id); setOrdered(false); }}
                      className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'border-snaporange-500 bg-orange-50/40 ring-1 ring-snaporange-500'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {/* Radio Circle */}
                        <div className={`h-4 w-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                          isSelected ? 'border-snaporange-500 bg-snaporange-500' : 'border-slate-300'
                        }`}>
                          {isSelected && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
                        </div>

                        <div>
                          <span className="font-extrabold text-slate-900 text-sm">
                            {inr(p.monthlyPayment)} <span className="font-semibold text-slate-600 text-xs">x {p.tenureMonths} months</span>
                          </span>
                          <span className="block text-[11px] text-slate-500 mt-0.5">
                            {p.provider} {p.interestRate > 0 ? `(${p.interestRate}% p.a.)` : ''}
                          </span>
                        </div>
                      </div>

                      {/* Right Tag */}
                      <div className="flex flex-col items-end gap-1">
                        {p.interestRate === 0 ? (
                          <span className="badge-zero-orange text-[11px] font-bold">
                            0% EMI
                          </span>
                        ) : (
                          <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                            {p.interestRate}% EMI
                          </span>
                        )}
                        {p.cashback > 0 && (
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                            + ₹{p.cashback.toLocaleString('en-IN')} cashback
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Subtext */}
              <p className="text-[10px] text-slate-400 mt-3">
                *Total extra payment per month/order value calculated dynamically from backend API.
              </p>

              {/* Orange Primary Action Button */}
              {plan && (
                <div className="mt-5">
                  <button
                    onClick={() => setOrdered(true)}
                    className="w-full btn-orange py-3.5 text-base font-black uppercase tracking-wide flex items-center justify-center gap-2 shadow-lg"
                  >
                    Proceed with {plan.tenureMonths} months EMI
                  </button>
                </div>
              )}

              {/* Order Confirmation Banner */}
              {ordered && plan && (
                <div className="mt-4 rounded-xl bg-emerald-50 border border-emerald-200 p-4 text-emerald-800 text-xs font-semibold animate-fadeIn">
                  <p className="font-bold text-sm">🎉 Order Placed Successfully!</p>
                  <p className="mt-1">
                    Your order for <strong>{product.name} ({variant.name})</strong> has been registered with EMI plan of{' '}
                    <strong>{inr(plan.monthlyPayment)}/mo x {plan.tenureMonths} months</strong>. Our representative will contact you for instant KYC verification.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Seller & Delivery Specs footer matching Snapmint */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 text-xs text-slate-600 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800">Sold By: <span className="text-snaporange-600">1Fi Authorized Partner</span></span>
              <span className="text-slate-400">›</span>
            </div>
            <hr className="border-slate-100" />
            <div>
              <p className="font-bold text-slate-800">Shipping Details:</p>
              <p className="text-slate-500 mt-0.5">Dispatch in less than 24 hours and delivery in 3-5 working days after dispatch.</p>
            </div>
            <hr className="border-slate-100" />
            <div className="flex items-center gap-4 text-[11px] font-medium text-slate-500">
              <span>✅ 100% Brand Guarantee</span>
              <span>✅ Easy Returns</span>
              <span>✅ Mutual Fund EMI Secured</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Center({ children }) {
  return <div className="mx-auto flex max-w-7xl items-center justify-center px-4 py-20">{children}</div>;
}

function Spinner() {
  return (
    <div className="text-center">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-snaporange-500 mx-auto" />
      <p className="mt-3 text-xs font-semibold text-slate-500">Loading product details...</p>
    </div>
  );
}
