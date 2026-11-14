import { notFound } from "next/navigation";

import { getSite, getPage } from "@/lib/pages";
import { renderNode } from "@/lib/renderer";

export const dynamic = "force-dynamic";

type PublicPageProps = {
  params: Promise<{
    site: string;
    path?: string[];
  }>;
};

export default async function PublicPage({
  params
}: PublicPageProps) {
  const { site: siteSlug, path } = await params;

  const pagePath = path?.length
    ? `/${path.join("/")}`
    : "/";

  const [site, page] = await Promise.all([
    getSite(siteSlug),
    getPage(siteSlug, pagePath)
  ]);

  if (!site || !page) {
    notFound();
  }

  return (
    <main
      style={{
        width: "100%",
        maxWidth: "1100px",
        margin: "0 auto",
        padding: "24px",
        color: site.theme.text,
        backgroundColor: "#ffffff"
      }}
    >
      <h1
        style={{
          fontSize: "2rem",
          fontWeight: 700,
          marginBottom: "16px"
        }}
      >
        {site.name}
      </h1>

      <h2
        style={{
          fontSize: "1.5rem",
          marginBottom: "24px"
        }}
      >
        {page.title}
      </h2>

      {page.components.map(node =>
        renderNode(node, site.theme)
      )}
    </main>
  );
}

