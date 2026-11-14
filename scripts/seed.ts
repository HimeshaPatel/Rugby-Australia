
import { MongoClient } from "mongodb";

import {
    wallabies,
    wallaroos,
    samplePage,
    wallaroosPage
} from "../lib/sample-data";

import type {
    Site,
    Page
} from "../lib/types";

async function seed() {
    const uri = process.env.MONGODB_URI;
    const databaseName = process.env.MONGODB_DB;

    if (!uri || !databaseName) {
        throw new Error(
            "Missing MongoDB environment variables"
        );
    }

    const client = new MongoClient(uri);

    try {
        await client.connect();

        const db = client.db(databaseName);

        const sites = db.collection<Site>("sites");
        const pages = db.collection<Page>("pages");

        // Prevent duplicate website slugs.

        await sites.createIndex(
            { slug: 1 },
            { unique: true }
        );

        // Prevent duplicate paths within the same site.

        await pages.createIndex(
            { siteSlug: 1, path: 1 },
            { unique: true }
        );

        // Insert websites if they do not already exist.

        for (const site of [wallabies, wallaroos]) {
            await sites.updateOne(
                { slug: site.slug },
                { $setOnInsert: site },
                { upsert: true }
            );
        }

        // Insert pages if they do not already exist.

        for (const page of [samplePage, wallaroosPage]) {
            await pages.updateOne(
                {
                    siteSlug: page.siteSlug,
                    path: page.path
                },
                { $setOnInsert: page },
                { upsert: true }
            );
        }

        console.log("Database seeded successfully");

        console.log(
            "Sites:",
            await sites.countDocuments()
        );

        console.log(
            "Pages:",
            await pages.countDocuments()
        );
    } finally {
        await client.close();
    }
}

seed().catch(error => {
    console.error("Seed failed:", error);
    process.exitCode = 1;
});
