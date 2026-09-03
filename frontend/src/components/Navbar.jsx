import { Link } from 'react-router-dom';

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
      {/* Top Banner / Nav */}
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 py-3">
        <Link to="/" className="flex items-center gap-2 group shrink-0">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-snaporange-500 to-amber-600 text-lg font-black text-white shadow-sm">
            1F
          </span>
          <span className="text-xl font-black tracking-tight text-slate-900">
            1Fi <span className="text-snaporange-500">Store</span>
          </span>
        </Link>

        {/* Search Bar matching Snapmint header */}
        <div className="hidden md:flex flex-1 max-w-md mx-8">
          <div className="relative w-full">
            <input
              type="text"
              placeholder="Search for Mobiles, Electronics, EMI plans..."
              className="w-full bg-slate-100 hover:bg-slate-200/70 focus:bg-white border border-transparent focus:border-snaporange-500 rounded-full py-2 pl-10 pr-4 text-sm text-slate-800 placeholder-slate-400 outline-none transition-all"
              readOnly
            />
            <svg
              className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>

        {/* Right CTA Links */}
        <div className="flex items-center gap-4 text-sm font-medium text-slate-600">
          <span className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            0% EMI Available
          </span>
          <Link
            to="/"
            className="hover:text-snaporange-500 transition-colors text-xs font-bold text-slate-700 uppercase tracking-wide hidden lg:block"
          >
            For Business
          </Link>
          <Link
            to="/"
            className="bg-snaporange-500 hover:bg-snaporange-600 text-white font-bold px-4 py-2 rounded-xl text-xs shadow-sm transition-all"
          >
            Pay EMI
          </Link>
        </div>
      </div>

      {/* Sub Category Bar */}
      <div className="hidden lg:block border-t border-slate-100 bg-slate-50/80 px-4 sm:px-6 py-2">
        <div className="mx-auto max-w-7xl flex items-center justify-between text-xs font-semibold text-slate-600">
          <div className="flex items-center gap-6">
            <Link to="/" className="text-snaporange-500 font-bold hover:underline">Deals</Link>
            <Link to="/" className="text-slate-800 font-bold hover:text-snaporange-500">Mobiles</Link>
            <Link to="/" className="hover:text-snaporange-500">Electronics</Link>
            <Link to="/" className="hover:text-snaporange-500">TV & Appliances</Link>
            <Link to="/" className="hover:text-snaporange-500">Kitchen & Home</Link>
            <Link to="/" className="hover:text-snaporange-500">Mutual Fund EMI Plans</Link>
          </div>
          <div className="text-slate-500 text-[11px]">
            ⚡ Instant Approval with 0% Processing Fee
          </div>
        </div>
      </div>
    </header>
  );
}
