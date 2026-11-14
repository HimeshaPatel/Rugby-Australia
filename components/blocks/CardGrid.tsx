
import type { CardGridProps, Theme } from "@/lib/types";
import { Heading } from "@/components/primitives/Heading";
import { Image } from "@/components/primitives/Image";
import { Button } from "@/components/primitives/Button";

type Props = CardGridProps & {
  theme: Theme;
};

export function CardGrid({ title, cards, theme }: Props) {
  return (
    <div>
      <Heading title={title} />

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "16px",
          marginTop: "16px"
        }}
      >
        {cards.map((card, index) => (
          <article
            key={index}
            style={{
              backgroundColor: theme.light,
              color: theme.text,
              padding: "16px",
              borderRadius: "8px"
            }}
          >
            <Image
              url={card.image.url}
              alt={card.image.alt}
            />

            <h3
              style={{
                fontSize: "1.1rem",
                fontWeight: 600,
                margin: "12px 0"
              }}
            >
              {card.heading}
            </h3>

            {card.link && (
              <Button
                label={card.link.label}
                href={card.link.href}
                theme={theme}
              />
            )}
          </article>
        ))}
      </div>
    </div>
  );
}
