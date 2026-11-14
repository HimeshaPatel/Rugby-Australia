import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* HEADER */}
      <header className="bg-emerald-950 text-white shadow-md border-b border-emerald-900">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-800 border border-emerald-700/60 flex items-center justify-center font-black text-amber-400">
              RA
            </div>
            <div>
              <span className="font-extrabold tracking-tight text-white block leading-tight text-base sm:text-lg">
                Rugby Australia
              </span>
              <span className="text-2xs text-emerald-300/80 uppercase tracking-wider block">
                Multi-Site Network
              </span>
            </div>
          </div>

          <Link
            href="/manager"
            className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-emerald-800/80 hover:bg-emerald-800 text-emerald-100 transition-colors"
          >
            Website Manager
          </Link>
        </div>
      </header>

      {/* 404 CONTENT */}
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center space-y-6 bg-white p-8 sm:p-10 rounded-2xl border border-slate-200 shadow-sm">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-800 border border-emerald-200">
            <span className="text-2xl font-black">404</span>
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 uppercase">
              Page Not Found
            </h1>
            <p className="text-sm text-slate-500 leading-relaxed">
              The requested rugby page or website path could not be found. It may have been moved, deleted, or does not exist.
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/sites/wallabies"
              className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold uppercase tracking-wider transition-all shadow-xs"
            >
              Wallabies Homepage
            </Link>

            <Link
              href="/manager"
              className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold uppercase tracking-wider transition-all"
            >
              Website Manager
            </Link>
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-slate-200 bg-white py-4 text-center text-xs text-slate-400">
        Rugby Australia Multi-Site Architecture Demonstration
      </footer>
    </div>
  );
}

