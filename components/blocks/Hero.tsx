import type { HeroProps, Theme } from "@/lib/types";

type Props = HeroProps & {
  theme: Theme;
};

export function Hero({ heading, description, theme }: Props) {
  return (
    <div
      style={{
        backgroundColor: theme.light,
        color: theme.text,
      }}
      className="rounded-2xl p-8 sm:p-12 mb-6 sm:mb-8 text-center border border-black/5 shadow-xs"
    >
      <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tight mb-4">
        {heading}
      </h1>
      {description && (
        <p className="text-base sm:text-lg opacity-85 max-w-2xl mx-auto leading-relaxed">
          {description}
        </p>
      )}
    </div>
  );
}
