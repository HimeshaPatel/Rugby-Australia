
import type { Page, Site } from "@/lib/types";

// WALLABIES SITE

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

// WALLAROOS SITE

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

// WALLABIES HOMEPAGE

export const samplePage: Page = {
  siteSlug: "wallabies",
  path: "/",
  title: "Meet Our National Team",

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
                  alt: "Rugby ball illustration"
                },
                heading: "Our Players"
              },
              {
                image: {
                  url: "/rugby.svg",
                  alt: "Rugby ball illustration"
                },
                heading: "Latest News"
              }
            ]
          },

          children: []
        },

        // NESTED TWO-COLUMN SECTION

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

                cards: [
                  {
                    image: {
                      url: "/rugby.svg",
                      alt: "Rugby ball illustration"
                    },

                    heading: "Meet the Wallaroos",

                    link: {
                      label: "Explore the Wallaroos",
                      href: "/sites/wallaroos"
                    }
                  }
                ]
              },

              children: []
            },

            {
              id: "card-grid-3",
              type: "CardGrid",

              props: {
                title: "Latest Rugby News",

                cards: [
                  {
                    image: {
                      url: "/rugby.svg",
                      alt: "Rugby ball illustration"
                    },

                    heading: "Australian Rugby"
                  }
                ]
              },

              children: []
            }
          ]
        }
      ]
    }
  ]
};

// WALLAROOS HOMEPAGE

export const wallaroosPage: Page = {
  siteSlug: "wallaroos",
  path: "/",
  title: "Meet the Wallaroos",

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
            title: "Our National Team",

            cards: [
              {
                image: {
                  url: "/rugby.svg",
                  alt: "Rugby ball illustration"
                },

                heading: "Meet Our Players"
              },
              {
                image: {
                  url: "/rugby.svg",
                  alt: "Rugby ball illustration"
                },

                heading: "Explore the Wallabies",

                link: {
                  label: "Visit Wallabies",
                  href: "/sites/wallabies"
                }
              }
            ]
          },

          children: []
        }
      ]
    }
  ]
};
