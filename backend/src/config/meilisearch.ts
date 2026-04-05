import { MeiliSearch } from "meilisearch";
import { config } from "./index";
import { logger } from "../utils/logger";

export const meiliClient = new MeiliSearch({
  host: config.MEILISEARCH_HOST,
  apiKey: config.MEILISEARCH_API_KEY,
});

export const MEILI_INDEXES = {
  events: "events",
};

export async function setupMeilisearch() {
  try {
    const index = meiliClient.index(MEILI_INDEXES.events);

    await index.updateFilterableAttributes([
      "category",
      "city",
      "status",
      "dateStart",
      "isFeatured",
    ]);
    await index.updateSortableAttributes([
      "dateStart",
      "createdAt",
      "availableSeats",
    ]);
    await index.updateSearchableAttributes([
      "title",
      "description",
      "venue",
      "city",
      "tags",
    ]);
    await index.updateRankingRules([
      "words",
      "typo",
      "proximity",
      "attribute",
      "sort",
      "exactness",
    ]);

    logger.info("✅ Meilisearch indexes configured");
  } catch {
    logger.warn("Meilisearch not available — search will be limited");
  }
}
