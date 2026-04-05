import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import EventCard from "@/features/events/EventCard";
import EventFiltersBar, {
  type EventFilters,
} from "@/features/events/EventFiltersBar";
import { EventCardSkeleton, Pagination } from "@/components/ui";
import { eventsService } from "@/services/events.service";
import { queryKeys } from "@/lib/queryClient";
import { DEFAULT_PAGE_SIZE } from "@/utils/constants";

export default function EventsPage() {
  const [filters, setFilters] = useState<EventFilters>({});
  const [page, setPage] = useState(1);

  // reset to page 1 when filters change
  const handleFiltersChange = (f: EventFilters) => {
    setFilters(f);
    setPage(1);
  };

  const parsedFilters = {
    page,
    limit: DEFAULT_PAGE_SIZE,
    search: filters.search,
    category: filters.category,
    city: filters.city,
    isFree: filters.isFree,
    startDate: filters.startDate,
    endDate: filters.endDate,
    sort: filters.sort,
  };

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.events.list(parsedFilters),
    queryFn: () => eventsService.getAll(parsedFilters),
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Discover Events</h1>
        <p className="mt-1 text-gray-500">
          Find and book amazing events near you
        </p>
      </div>

      <EventFiltersBar filters={filters} onChange={handleFiltersChange} />

      <div className="mt-8">
        {isLoading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <EventCardSkeleton key={i} />
            ))}
          </div>
        ) : data?.data.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <p className="text-xl font-medium">No events found</p>
            <p className="text-sm">Try adjusting your filters</p>
          </div>
        ) : (
          <motion.div
            layout
            className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          >
            {data?.data.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </motion.div>
        )}
      </div>

      {data && data.meta.pages > 1 && (
        <div className="mt-10">
          <Pagination
            page={data.meta.page}
            pages={data.meta.pages}
            total={data.meta.total}
            limit={data.meta.limit}
            onPageChange={setPage}
          />
        </div>
      )}
    </div>
  );
}
