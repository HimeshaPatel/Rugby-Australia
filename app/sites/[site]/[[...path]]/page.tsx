import Link from "next/link";
import { notFound } from "next/navigation";

import { getSite, getPage } from "@/lib/pages";
import { renderNode } from "@/lib/renderer";

export const dynamic = "force-dynamic";

type PublicPageProps = {
  params: Promise<{
    site: string;
    path?: string[];
  }>;
};

export default async function PublicPage({
  params
}: PublicPageProps) {
  const { site: siteSlug, path } = await params;

  const pagePath = path?.length
    ? `/${path.join("/")}`
    : "/";

  const [site, page] = await Promise.all([
    getSite(siteSlug),
    getPage(siteSlug, pagePath)
  ]);

  if (!site || !page) {
    notFound();
  }

  const isWallabies = site.slug === "wallabies";

  return (
    <div
      style={{
        backgroundColor: "#fafafa",
        color: site.theme.text
      }}
      className="min-h-screen flex flex-col font-sans"
    >
      {/* PROFESSIONAL TEAM HEADER */}
      <header
        style={{
          backgroundColor: site.theme.brand,
          color: site.theme.onBrand
        }}
        className="w-full shadow-md sticky top-0 z-30 transition-colors duration-200"
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-white/20 backdrop-blur-xs flex items-center justify-center font-black text-sm uppercase tracking-wider">
              {site.name.charAt(0)}
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight uppercase leading-none">
                {site.name}
              </h1>
              <p className="text-xs uppercase font-medium tracking-widest opacity-80 mt-0.5">
                Rugby Australia Multi-Site Demonstration
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <Link
              href="/manager"
              className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-black/15 hover:bg-black/25 backdrop-blur-xs transition-colors flex items-center gap-1.5"
            >
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
              <span>Edit in Manager</span>
            </Link>
          </div>
        </div>
      </header>

      {/* PAGE HERO / TITLE BANNER */}
      <div
        style={{
          backgroundColor: site.theme.light,
          color: site.theme.text
        }}
        className="border-b border-black/5"
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider opacity-75">
              <span>{site.name}</span>
              <span>/</span>
              <span className="opacity-90">{page.path === "/" ? "Home" : page.path.replace(/^\//, "")}</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight uppercase">
              {page.title}
            </h2>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <main className="max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 flex-1">
        {page.components.length > 0 ? (
          <div className="space-y-6 sm:space-y-8">
            {page.components.map(node =>
              renderNode(node, site.theme)
            )}
          </div>
        ) : (
          <div className="text-center py-14 px-4">
            <p className="text-base font-medium text-slate-500">
              No components have been added to this page yet.
            </p>
          </div>
        )}
      </main>

      {/* FOOTER */}
      <footer className="w-full border-t border-slate-200 bg-white py-6 mt-12 text-slate-500 text-xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© Rugby Australia Multi-Site Architecture Demonstration</p>
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-1.5">
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: site.theme.brand }}
              />
              Theme: {isWallabies ? "Wallabies Gold & Green" : "Wallaroos Forest & Mint"}
            </span>
            <span>•</span>
            <Link href="/manager" className="hover:underline font-medium">
              Website Manager
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
