import { meiliClient, MEILI_INDEXES } from "../../config/meilisearch";
import { eventsRepository } from "../events/events.repository";
import { getPaginationParams, paginatedResponse } from "../../utils/pagination";

export const searchService = {
  async searchEvents(
    query: string,
    filters: Record<string, unknown>,
    page = 1,
    limit = 12,
  ) {
    try {
      const { skip } = getPaginationParams({ page, limit });
      const result = await meiliClient
        .index(MEILI_INDEXES.events)
        .search(query, {
          offset: skip,
          limit,
          filter: buildMeiliFilter(filters),
          sort: ["dateStart:asc"],
        });

      return {
        data: result.hits,
        meta: {
          page,
          limit,
          total: result.estimatedTotalHits ?? 0,
          totalPages: Math.ceil((result.estimatedTotalHits ?? 0) / limit),
          hasNext: (result.estimatedTotalHits ?? 0) > skip + limit,
          hasPrev: page > 1,
        },
      };
    } catch {
      // Fallback to DB search
      return searchService.fallbackSearch(query, filters, page, limit);
    }
  },

  async fallbackSearch(
    query: string,
    filters: Record<string, unknown>,
    page = 1,
    limit = 12,
  ) {
    const { events, total } = await eventsRepository.findAll({
      search: query,
      status: "PUBLISHED",
      ...(filters as Record<string, unknown>),
      page,
      limit,
    });
    return paginatedResponse(events, page, limit, total);
  },
};

function buildMeiliFilter(filters: Record<string, unknown>): string[] {
  const f: string[] = ['status = "PUBLISHED"'];
  if (filters.category) f.push(`category = "${filters.category}"`);
  if (filters.city) f.push(`city = "${filters.city}"`);
  if (filters.isFeatured) f.push("isFeatured = true");
  if (filters.dateFrom)
    f.push(`dateStart >= ${new Date(filters.dateFrom as string).getTime()}`);
  if (filters.dateTo)
    f.push(`dateStart <= ${new Date(filters.dateTo as string).getTime()}`);
  return f;
}
