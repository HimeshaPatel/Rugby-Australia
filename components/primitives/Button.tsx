
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
        display: "inline-block",
        backgroundColor: theme.brand,
        color: theme.onBrand,
        padding: "10px 16px",
        borderRadius: "6px",
        textDecoration: "none"
      }}
    >
      {label}
    </a>
  );
}
