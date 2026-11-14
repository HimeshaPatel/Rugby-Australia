
import "server-only";

import { MongoClient } from "mongodb";

const globalForMongo = globalThis as typeof globalThis & {
    rugbyMongoClient?: MongoClient;
};

export function getDb() {
    const uri = process.env.MONGODB_URI;
    const databaseName = process.env.MONGODB_DB;

    if (!uri || !databaseName) {
        throw new Error(
            "Missing MongoDB environment variables"
        );
    }

    if (!globalForMongo.rugbyMongoClient) {
        globalForMongo.rugbyMongoClient =
            new MongoClient(uri);
    }

    return globalForMongo.rugbyMongoClient.db(
        databaseName
    );
}
