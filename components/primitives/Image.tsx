type ImageProps = {
  url: string;
  alt: string;
};

export function Image({ url, alt }: ImageProps) {
  const hasUrl = typeof url === "string" && url.trim().length > 0;
  const isSvg = hasUrl && url.toLowerCase().endsWith(".svg");

  if (!hasUrl) {
    return (
      <div
        className="relative w-full aspect-16/10 overflow-hidden rounded-xl bg-slate-200/70 flex flex-col items-center justify-center text-slate-500 p-4 border border-black/5"
        role="img"
        aria-label={alt || "Placeholder image"}
      >
        <svg
          className="w-8 h-8 text-slate-400 opacity-70 mb-1"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
        <span className="text-2xs font-semibold uppercase tracking-wider text-slate-500 opacity-80">
          No Image Available
        </span>
      </div>
    );
  }

  return (
    <div className="relative w-full aspect-16/10 overflow-hidden rounded-xl bg-slate-100/90 flex items-center justify-center">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={url}
        alt={alt}
        className={`w-full h-full transition-transform duration-300 hover:scale-102 ${
          isSvg
            ? "object-contain p-2.5 max-h-full"
            : "object-cover"
        }`}
        loading="lazy"
      />
    </div>
  );
}
