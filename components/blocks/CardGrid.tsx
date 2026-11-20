import type { CardGridProps, Theme } from "@/lib/types";
import { Heading } from "@/components/primitives/Heading";
import { Image } from "@/components/primitives/Image";
import { Button } from "@/components/primitives/Button";

type Props = CardGridProps & {
  theme: Theme;
};

export function CardGrid({ title, subtitle, cards, footerLink, theme }: Props) {
  const hasCards = cards && cards.length > 0;

  return (
    <div className="w-full">
      {title && <Heading title={title} />}
      {subtitle && (
        <p className="text-sm sm:text-base opacity-80 -mt-3 mb-5 leading-relaxed">
          {subtitle}
        </p>
      )}

      {hasCards ? (
        <div
          className={`w-full ${cards.length === 1 ? "max-w-md sm:max-w-lg" : ""}`}
          style={{
            display: "grid",
            gridTemplateColumns:
              cards.length === 1
                ? "1fr"
                : cards.length === 2
                  ? "repeat(auto-fit, minmax(min(100%, 280px), 1fr))"
                  : "repeat(auto-fit, minmax(min(100%, 250px), 1fr))",
            gap: "1.5rem"
          }}
        >
          {cards.map((card, index) => (
            <article
              key={index}
              style={{
                backgroundColor: theme.light,
                color: theme.text
              }}
              className="group flex flex-col rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all duration-200 border border-black/5"
            >
              <div className="p-2.5 pb-0">
                <Image
                  url={card.image?.url ?? ""}
                  alt={card.image?.alt ?? card.heading ?? "Card image"}
                />
              </div>

              <div className="p-5 sm:p-6 flex flex-col flex-1 justify-between gap-4">
                <h3 className="text-lg sm:text-xl font-bold tracking-tight leading-snug">
                  {card.heading}
                </h3>

                {card.link && (
                  <div className="pt-1">
                    <Button
                      label={card.link.label}
                      href={card.link.href}
                      theme={theme}
                    />
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>
      ) : (
        <p className="text-xs italic text-current opacity-60 my-1">
          No cards available in this section.
        </p>
      )}

      {footerLink && footerLink.label && (
        <div className="mt-6 flex justify-start">
          <Button
            label={footerLink.label}
            href={footerLink.href}
            theme={theme}
          />
        </div>
      )}
    </div>
  );
}
