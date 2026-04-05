import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  CalendarDaysIcon,
  MapPinIcon,
  UserGroupIcon,
  HeartIcon,
} from "@heroicons/react/24/outline";
import { HeartIcon as HeartSolidIcon } from "@heroicons/react/24/solid";
import { Badge, Button } from "@/components/ui";
import { formatDate, formatPrice } from "@/utils/format";
import { ROUTES } from "@/utils/constants";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { usersService } from "@/services/users.service";
import { useAuthStore } from "@/store/authStore";
import toast from "react-hot-toast";
import { queryKeys } from "@/lib/queryClient";

export interface EventSummary {
  id: string;
  title: string;
  slug: string;
  description: string;
  startDate: string;
  endDate: string;
  venueName: string;
  city: string;
  bannerUrl: string | null;
  status: string;
  availableSeats: number;
  totalSeats: number;
  minPrice: number;
  maxPrice: number;
  isFree: boolean;
  isWishlisted?: boolean;
  category: string;
}

interface EventCardProps {
  event: EventSummary;
}

export default function EventCard({ event }: EventCardProps) {
  const { isAuthenticated } = useAuthStore();
  const qc = useQueryClient();

  const wishlistMutation = useMutation({
    mutationFn: () => usersService.toggleWishlist(event.id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.user.wishlist });
      qc.invalidateQueries({ queryKey: queryKeys.events.all });
    },
    onError: () => toast.error("Failed to update wishlist"),
  });

  const availabilityPct =
    event.totalSeats > 0 ? (event.availableSeats / event.totalSeats) * 100 : 0;

  const availabilityColor =
    availabilityPct === 0 ? "red" : availabilityPct < 20 ? "yellow" : "green";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="group flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md"
    >
      {/* Banner */}
      <div className="relative h-48 overflow-hidden bg-gray-100">
        {event.bannerUrl ? (
          <img
            src={event.bannerUrl}
            alt={event.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50">
            <CalendarDaysIcon className="h-16 w-16 text-indigo-200" />
          </div>
        )}
        {/* Status badge */}
        <div className="absolute left-3 top-3">
          <Badge color={event.status === "PUBLISHED" ? "green" : "gray"}>
            {event.category}
          </Badge>
        </div>
        {/* Wishlist */}
        {isAuthenticated() && (
          <button
            onClick={() => wishlistMutation.mutate()}
            disabled={wishlistMutation.isPending}
            className="absolute right-3 top-3 rounded-full bg-white/80 p-1.5 backdrop-blur-sm transition-colors hover:bg-white"
            aria-label="Toggle wishlist"
          >
            {event.isWishlisted ? (
              <HeartSolidIcon className="h-5 w-5 text-red-500" />
            ) : (
              <HeartIcon className="h-5 w-5 text-gray-500" />
            )}
          </button>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-5">
        <Link to={ROUTES.EVENT_DETAIL(event.slug)}>
          <h3 className="line-clamp-2 text-base font-semibold text-gray-900 hover:text-indigo-600">
            {event.title}
          </h3>
        </Link>

        <div className="mt-2 space-y-1.5">
          <div className="flex items-center gap-1.5 text-sm text-gray-500">
            <CalendarDaysIcon className="h-4 w-4 shrink-0" />
            {formatDate(event.startDate, "dd MMM yyyy, hh:mm a")}
          </div>
          <div className="flex items-center gap-1.5 text-sm text-gray-500">
            <MapPinIcon className="h-4 w-4 shrink-0" />
            {event.venueName}, {event.city}
          </div>
          <div className="flex items-center gap-1.5 text-sm text-gray-500">
            <UserGroupIcon className="h-4 w-4 shrink-0" />
            <Badge
              color={availabilityColor as "green" | "yellow" | "red"}
              size="sm"
            >
              {event.availableSeats === 0
                ? "Sold out"
                : `${event.availableSeats} seats left`}
            </Badge>
          </div>
        </div>

        <div className="mt-auto flex items-center justify-between pt-4">
          <div>
            {event.isFree ? (
              <span className="text-lg font-bold text-green-600">Free</span>
            ) : (
              <span className="text-lg font-bold text-gray-900">
                {formatPrice(event.minPrice)}
                {event.maxPrice > event.minPrice && (
                  <span className="text-sm font-normal text-gray-500">
                    {" "}
                    — {formatPrice(event.maxPrice)}
                  </span>
                )}
              </span>
            )}
          </div>
          {event.availableSeats === 0 ? (
            <Button size="sm" variant="secondary" disabled>
              Sold out
            </Button>
          ) : (
            <Link to={ROUTES.EVENT_DETAIL(event.slug)}>
              <Button size="sm" variant="primary">
                Book now
              </Button>
            </Link>
          )}
        </div>
      </div>
    </motion.div>
  );
}
