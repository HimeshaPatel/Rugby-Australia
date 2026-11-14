
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

  return (
    <section
      style={{
        backgroundColor,
        color:
          background === "brand"
            ? theme.onBrand
            : background === "light"
              ? theme.text
              : "inherit",
        padding: "24px",
        borderRadius: "8px",
        marginBottom: "16px"
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            layout === "two-column"
              ? "repeat(2, minmax(0, 1fr))"
              : "minmax(0, 1fr)",
          gap: "16px"
        }}
      >
        {children}
      </div>
    </section>
  );
}
