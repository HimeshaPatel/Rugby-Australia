
import "server-only";

import { getDb } from "./db";
import type { Page, Site } from "./types";

export async function getSites(): Promise<Site[]> {
    const db = getDb();

    return db
        .collection<Site>("sites")
        .find<Site>({}, { projection: { _id: 0 } })
        .sort({ name: 1 })
        .toArray();
}

export async function getPages(): Promise<Page[]> {
    const db = getDb();

    return db
        .collection<Page>("pages")
        .find<Page>({}, { projection: { _id: 0 } })
        .sort({ path: 1 })
        .toArray();
}

// NEW: Find one website using its slug.

export async function getSite(
    slug: string
): Promise<Site | null> {
    const db = getDb();

    return db
        .collection<Site>("sites")
        .findOne<Site>(
            { slug },
            { projection: { _id: 0 } }
        );
}

// NEW: Find one page using its site and path.

export async function getPage(
    siteSlug: string,
    path: string
): Promise<Page | null> {
    const db = getDb();

    return db
        .collection<Page>("pages")
        .findOne<Page>(
            { siteSlug, path },
            { projection: { _id: 0 } }
        );
}
