import type { ReactNode } from "react";
import type {
  ComponentType,
  PropsByType,
  Theme
} from "@/lib/types";

import { Section } from "@/components/blocks/Section";
import { CardGrid } from "@/components/blocks/CardGrid";
import { Hero } from "@/components/blocks/Hero";

type Registry = {
  [K in ComponentType]: (
    props: PropsByType[K],
    children: ReactNode,
    id: string,
    theme: Theme
  ) => ReactNode;
};

export const registry: Registry = {
  Section: (props, children, id, theme) => (
    <Section key={id} {...props} theme={theme}>
      {children}
    </Section>
  ),

  CardGrid: (props, _children, id, theme) => (
    <CardGrid key={id} {...props} theme={theme} />
  ),

  Hero: (props, _children, id, theme) => (
    <Hero key={id} {...props} theme={theme} />
  )
};
