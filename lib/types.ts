export type Theme = {
  brand: string;
  light: string;
  text: string;
  onBrand: string;
};

export type SectionProps = {
  layout: "full" | "two-column" | "three-column";
  background: "none" | "light" | "brand";
};

export type Card = {
  image: {
    url: string;
    alt: string;
  };
  heading: string;
  link?: {
    label: string;
    href: string;
  };
};

export type CardGridProps = {
  title: string;
  subtitle?: string;
  cards: Card[];
  footerLink?: {
    label: string;
    href: string;
  };
};

export type PropsByType = {
  Section: SectionProps;
  CardGrid: CardGridProps;
};

export type ComponentType = keyof PropsByType;

export type PageNode<K extends ComponentType = ComponentType> = {
  [T in K]: {
    id: string;
    type: T;
    props: PropsByType[T];
    children: PageNode[];
  };
}[K];

export type Site = {
  slug: string;
  name: string;
  theme: Theme;
};

export type Page = {
  siteSlug: string;
  path: string;
  title: string;
  components: PageNode[];
};
