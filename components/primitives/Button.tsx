import type { Theme } from "@/lib/types";

type ButtonProps = {
  label: string;
  href: string;
  theme: Theme;
};

export function Button({ label, href, theme }: ButtonProps) {
  return (
    <a
      href={href}
      style={{
        backgroundColor: theme.brand,
        color: theme.onBrand,
      }}
      className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm sm:text-base font-bold uppercase tracking-wider shadow-sm transition-all duration-200 hover:opacity-90 hover:shadow hover:-translate-y-0.5 active:translate-y-0 text-center focus:outline-hidden focus:ring-2 focus:ring-offset-2"
    >
      <span>{label}</span>
      <svg
        className="w-4 h-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2.5"
          d="M9 5l7 7-7 7"
        />
      </svg>
    </a>
  );
}
