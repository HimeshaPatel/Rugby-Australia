
import type { Page, Site } from "@/lib/types";

export const wallabies: Site = {
  slug: "wallabies",
  name: "Wallabies",
  theme: {
    brand: "#F4C430",
    light: "#FFF7D6",
    text: "#173C2B",
    onBrand: "#173C2B"
  }
};

export const wallaroos: Site = {
  slug: "wallaroos",
  name: "Wallaroos",
  theme: {
    brand: "#173C2B",
    light: "#E4EFE8",
    text: "#173C2B",
    onBrand: "#FFFFFF"
  }
};

export const samplePage: Page = {
  siteSlug: "wallabies",
  path: "/",
  title: "Meet the Team",
  components: [
    {
      id: "section-1",
      type: "Section",
      props: {
        layout: "full",
        background: "brand"
      },
      children: [
        {
          id: "card-grid-1",
          type: "CardGrid",
          props: {
            title: "Meet the Wallabies",
            cards: [
              {
                image: {
                  url: "/rugby.svg",
                  alt: "Rugby ball"
                },
                heading: "Our Players",
                link: {
                  label: "View Players",
                  href: "/players"
                }
              },
              {
                image: {
                  url: "/rugby.svg",
                  alt: "Rugby ball"
                },
                heading: "Latest News"
              }
            ]
          },
          children: []
        },
        {
          id: "section-2",
          type: "Section",
          props: {
            layout: "two-column",
            background: "light"
          },
          children: [
            {
              id: "card-grid-2",
              type: "CardGrid",
              props: {
                title: "Wallaroos",
                cards: []
              },
              children: []
            },
            {
              id: "card-grid-3",
              type: "CardGrid",
              props: {
                title: "Latest Rugby News",
                cards: []
              },
              children: []
            }
          ]
        }
      ]
    }
  ]
};

export const wallaroosPage: Page = {
  siteSlug: "wallaroos",
  path: "/",
  title: "Wallaroos Home",

  components: [
    {
      id: "wallaroos-section-1",
      type: "Section",

      props: {
        layout: "full",
        background: "brand"
      },

      children: [
        {
          id: "wallaroos-card-grid-1",
          type: "CardGrid",

          props: {
            title: "Meet the Wallaroos",

            cards: [
              {
                image: {
                  url: "/rugby.svg",
                  alt: "Rugby ball"
                },

                heading: "Our National Team"
              },
              {
                image: {
                  url: "/rugby.svg",
                  alt: "Rugby ball"
                },

                heading: "Latest Rugby News"
              }
            ]
          },

          children: []
        }
      ]
    }
  ]
};
