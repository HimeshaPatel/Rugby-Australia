import type { ReactNode } from "react";
import type { SectionProps, Theme } from "@/lib/types";

type Props = SectionProps & {
  children?: ReactNode;
  theme: Theme;
};

export function Section({
  layout,
  background,
  children,
  theme
}: Props) {
  const backgroundColor =
    background === "brand"
      ? theme.brand
      : background === "light"
        ? theme.light
        : "transparent";

  const color =
    background === "brand"
      ? theme.onBrand
      : background === "light"
        ? theme.text
        : "inherit";

  const hasBackground = background !== "none";

  return (
    <section
      style={{
        backgroundColor,
        color
      }}
      className={`rounded-2xl transition-all duration-200 mb-6 sm:mb-8 last:mb-0 ${
        hasBackground
          ? "p-5 sm:p-7 md:p-8 shadow-xs"
          : "p-0"
      }`}
    >
      <div
        className={`grid gap-6 ${
          layout === "two-column"
            ? "grid-cols-1 md:grid-cols-2 items-start"
            : "grid-cols-1"
        }`}
      >
        {children}
      </div>
    </section>
  );
}
