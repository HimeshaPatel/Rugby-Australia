
"use server";

import { MongoServerError } from "mongodb";

import { getDb } from "@/lib/db";
import { isValidPage } from "@/lib/validation";

import type { Site, Page } from "@/lib/types";

type SaveResult =
    | { ok: true }
    | { ok: false; error: string };

export async function savePage(
    input: unknown,
    mode: "create" | "update"
): Promise<SaveResult> {
    if (!isValidPage(input)) {
        return {
            ok: false,
            error: "Invalid page or component data."
        };
    }

    if (mode !== "create" && mode !== "update") {
        return {
            ok: false,
            error: "Invalid save operation."
        };
    }

    try {
        const db = getDb();

        const sites = db.collection<Site>("sites");
        const pages = db.collection<Page>("pages");

        const site = await sites.findOne({
            slug: input.siteSlug
        });

        if (!site) {
            return {
                ok: false,
                error: "The selected website does not exist."
            };
        }

        const page: Page = {
            siteSlug: input.siteSlug,
            path: input.path,
            title: input.title,
            components: input.components
        };

        if (mode === "create") {
            await pages.insertOne(page);
        } else {
            const result = await pages.replaceOne(
                {
                    siteSlug: page.siteSlug,
                    path: page.path
                },
                page
            );

            if (result.matchedCount === 0) {
                return {
                    ok: false,
                    error: "Page not found."
                };
            }
        }

        return { ok: true };
    } catch (error) {
        if (
            error instanceof MongoServerError &&
            error.code === 11000
        ) {
            return {
                ok: false,
                error: "A page with this path already exists."
            };
        }

        console.error("Save page failed:", error);

        return {
            ok: false,
            error: "Unable to save the page."
        };
    }
}
