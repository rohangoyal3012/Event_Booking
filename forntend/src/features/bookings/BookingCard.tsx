import { Link } from "react-router-dom";
import { Badge, Button } from "@/components/ui";
import { formatDate, formatPrice } from "@/utils/format";
import { ROUTES, BOOKING_STATUS_COLORS } from "@/utils/constants";
import {
  CalendarDaysIcon,
  MapPinIcon,
  QrCodeIcon,
} from "@heroicons/react/24/outline";
import type { BadgeColor } from "@/components/ui";
export interface BookingSummary {
  id: string;
  bookingRef: string;
  status: string;
  totalAmount: number;
  createdAt: string;
  event: {
    id: string;
    title: string;
    slug: string;
    startDate: string;
    venueName: string;
    city: string;
    bannerUrl: string | null;
  };
  items: {
    ticketCategoryName: string;
    quantity: number;
    unitPrice: number;
  }[];
}

interface BookingCardProps {
  booking: BookingSummary;
  onViewTickets?: (bookingId: string) => void;
  onCancel?: (bookingId: string) => void;
}

export default function BookingCard({
  booking,
  onViewTickets,
  onCancel,
}: BookingCardProps) {
  const statusColor = (BOOKING_STATUS_COLORS[booking.status] ??
    "gray") as BadgeColor;
  const canCancel =
    booking.status === "CONFIRMED" || booking.status === "PENDING";

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="flex flex-col gap-4 p-5 sm:flex-row">
        {/* Event banner thumbnail */}
        <div className="h-24 w-32 shrink-0 overflow-hidden rounded-lg bg-gray-100">
          {booking.event.bannerUrl ? (
            <img
              src={booking.event.bannerUrl}
              alt={booking.event.title}
              className="h-full w-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <CalendarDaysIcon className="h-10 w-10 text-gray-300" />
            </div>
          )}
        </div>

        {/* Details */}
        <div className="flex flex-1 flex-col gap-3">
          <div className="flex items-start justify-between gap-2">
            <div>
              <Link
                to={ROUTES.EVENT_DETAIL(booking.event.slug)}
                className="text-base font-semibold text-gray-900 hover:text-indigo-600"
              >
                {booking.event.title}
              </Link>
              <p className="text-sm text-gray-500">Ref: {booking.bookingRef}</p>
            </div>
            <Badge color={statusColor}>{booking.status}</Badge>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-sm text-gray-500">
              <CalendarDaysIcon className="h-4 w-4" />
              {formatDate(booking.event.startDate, "dd MMM yyyy, hh:mm a")}
            </div>
            <div className="flex items-center gap-1.5 text-sm text-gray-500">
              <MapPinIcon className="h-4 w-4" />
              {booking.event.venueName}, {booking.event.city}
            </div>
          </div>

          {/* Ticket breakdown */}
          <div className="flex flex-wrap gap-2">
            {booking.items.map((item, i) => (
              <span
                key={i}
                className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs text-gray-700"
              >
                {item.quantity}× {item.ticketCategoryName}
              </span>
            ))}
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-base font-semibold text-gray-900">
              {formatPrice(booking.totalAmount)}
            </span>
            <div className="flex gap-2">
              {booking.status === "CONFIRMED" && onViewTickets && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onViewTickets(booking.id)}
                >
                  <QrCodeIcon className="h-4 w-4" />
                  Tickets
                </Button>
              )}
              {canCancel && onCancel && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onCancel(booking.id)}
                  className="text-red-600 hover:bg-red-50"
                >
                  Cancel
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
