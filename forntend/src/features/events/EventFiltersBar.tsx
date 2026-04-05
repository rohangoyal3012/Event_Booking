import { useState, useCallback } from "react";
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { Input, Button, Badge } from "@/components/ui";
import { EVENT_CATEGORIES } from "@/utils/constants";

export interface EventFilters {
  search?: string;
  category?: string;
  city?: string;
  isFree?: boolean;
  startDate?: string;
  endDate?: string;
  sort?: string;
}

interface EventFiltersBarProps {
  filters: EventFilters;
  onChange: (filters: EventFilters) => void;
}

const SORT_OPTIONS = [
  { label: "Upcoming", value: "startDate:asc" },
  { label: "Newest", value: "createdAt:desc" },
  { label: "Price: Low", value: "minPrice:asc" },
  { label: "Price: High", value: "minPrice:desc" },
  { label: "Popular", value: "totalSeats:desc" },
];

export default function EventFiltersBar({
  filters,
  onChange,
}: EventFiltersBarProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleSearch = useCallback(
    (value: string) => onChange({ ...filters, search: value || undefined }),
    [filters, onChange],
  );

  const activeCount = [
    filters.category,
    filters.city,
    filters.isFree,
    filters.startDate,
    filters.endDate,
  ].filter(Boolean).length;

  return (
    <div className="space-y-4">
      {/* Top bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex-1">
          <Input
            placeholder="Search events…"
            defaultValue={filters.search ?? ""}
            onChange={(e) => handleSearch(e.target.value)}
            leftIcon={<MagnifyingGlassIcon className="h-4 w-4" />}
          />
        </div>
        <div className="flex items-center gap-2">
          <select
            value={filters.sort ?? "startDate:asc"}
            onChange={(e) => onChange({ ...filters, sort: e.target.value })}
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAdvanced((v) => !v)}
          >
            <FunnelIcon className="h-4 w-4" />
            Filters
            {activeCount > 0 && (
              <Badge color="indigo" size="sm">
                {activeCount}
              </Badge>
            )}
          </Button>
        </div>
      </div>

      {/* Category quick-select */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => onChange({ ...filters, category: undefined })}
          className={`rounded-full px-3 py-1 text-sm font-medium transition-colors ${
            !filters.category
              ? "bg-indigo-600 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          All
        </button>
        {EVENT_CATEGORIES.slice(0, 8).map((cat) => (
          <button
            key={cat}
            onClick={() =>
              onChange({
                ...filters,
                category: filters.category === cat ? undefined : cat,
              })
            }
            className={`rounded-full px-3 py-1 text-sm font-medium transition-colors ${
              filters.category === cat
                ? "bg-indigo-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Advanced filters */}
      {showAdvanced && (
        <div className="flex flex-wrap items-end gap-4 rounded-xl border border-gray-200 bg-gray-50 p-4">
          <Input
            label="City"
            placeholder="Mumbai, Delhi…"
            value={filters.city ?? ""}
            onChange={(e) =>
              onChange({ ...filters, city: e.target.value || undefined })
            }
            fullWidth={false}
            className="w-44"
          />
          <Input
            label="From"
            type="date"
            value={filters.startDate ?? ""}
            onChange={(e) =>
              onChange({ ...filters, startDate: e.target.value || undefined })
            }
            fullWidth={false}
            className="w-44"
          />
          <Input
            label="To"
            type="date"
            value={filters.endDate ?? ""}
            onChange={(e) =>
              onChange({ ...filters, endDate: e.target.value || undefined })
            }
            fullWidth={false}
            className="w-44"
          />
          <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={!!filters.isFree}
              onChange={(e) =>
                onChange({ ...filters, isFree: e.target.checked || undefined })
              }
              className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            Free events only
          </label>
          {activeCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                onChange({ search: filters.search, sort: filters.sort })
              }
            >
              <XMarkIcon className="h-4 w-4" />
              Clear filters
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
