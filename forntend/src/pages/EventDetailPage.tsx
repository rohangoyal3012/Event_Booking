import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  CalendarDaysIcon,
  MapPinIcon,
  UserGroupIcon,
  ShareIcon,
} from "@heroicons/react/24/outline";
import { Badge, Button, FullPageSpinner } from "@/components/ui";
import TicketSelector from "@/features/events/TicketSelector";
import PaymentModal from "@/features/bookings/PaymentModal";
import { eventsService } from "@/services/events.service";
import { queryKeys } from "@/lib/queryClient";
import { formatDate, formatPrice } from "@/utils/format";
import { ROUTES } from "@/utils/constants";
import { useAuthStore } from "@/store/authStore";
import { useCartStore } from "@/store/cartStore";
import toast from "react-hot-toast";

export default function EventDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const { items, totalAmount, totalItems } = useCartStore();
  const [showPayment, setShowPayment] = useState(false);

  const {
    data: event,
    isLoading,
    isError,
  } = useQuery({
    queryKey: queryKeys.events.detail(slug!),
    queryFn: () => eventsService.getBySlug(slug!),
    enabled: !!slug,
  });

  if (isLoading) return <FullPageSpinner />;
  if (isError || !event) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4">
        <p className="text-xl font-medium text-gray-900">Event not found</p>
        <Button onClick={() => navigate(ROUTES.EVENTS)}>Browse events</Button>
      </div>
    );
  }

  const handleBookNow = () => {
    if (!isAuthenticated()) {
      navigate(ROUTES.LOGIN, { state: { returnTo: window.location.pathname } });
      return;
    }
    if (totalItems() === 0) {
      toast.error("Please select at least one ticket");
      return;
    }
    setShowPayment(true);
  };

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({ title: event.title, url: window.location.href });
    } else {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied!");
    }
  };

  return (
    <>
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Banner */}
        <div className="relative h-72 overflow-hidden rounded-2xl bg-gray-100 sm:h-96">
          {event.bannerUrl ? (
            <img
              src={event.bannerUrl}
              alt={event.title}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-100">
              <CalendarDaysIcon className="h-24 w-24 text-indigo-200" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          <div className="absolute bottom-4 left-6">
            <Badge color="indigo">{event.category}</Badge>
          </div>
          <button
            onClick={handleShare}
            className="absolute right-4 top-4 flex items-center gap-1.5 rounded-full bg-white/80 px-3 py-1.5 text-sm font-medium backdrop-blur-sm hover:bg-white"
          >
            <ShareIcon className="h-4 w-4" />
            Share
          </button>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Left — Event info */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {event.title}
              </h1>
              <div className="mt-3 flex flex-wrap gap-4 text-gray-600">
                <div className="flex items-center gap-1.5 text-sm">
                  <CalendarDaysIcon className="h-5 w-5 text-indigo-500" />
                  {formatDate(
                    event.startDate,
                    "EEEE, dd MMMM yyyy",
                  )} &bull; {formatDate(event.startDate, "hh:mm a")}
                </div>
                <div className="flex items-center gap-1.5 text-sm">
                  <MapPinIcon className="h-5 w-5 text-indigo-500" />
                  {event.venueName}, {event.venueAddress}, {event.city}
                </div>
                <div className="flex items-center gap-1.5 text-sm">
                  <UserGroupIcon className="h-5 w-5 text-indigo-500" />
                  {event.availableSeats} seats available
                </div>
              </div>
            </div>

            <div>
              <h2 className="mb-2 text-lg font-semibold text-gray-900">
                About this event
              </h2>
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-600">
                {event.description}
              </p>
            </div>

            {event.organizer && (
              <div className="flex items-center gap-3 rounded-xl border border-gray-200 p-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 text-lg font-bold text-indigo-700">
                  {event.organizer.name.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Organised by
                  </p>
                  <p className="text-base font-semibold text-gray-700">
                    {event.organizer.name}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Right — Ticket selection */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-semibold text-gray-900">
                Select Tickets
              </h2>
              <TicketSelector
                eventId={event.id}
                categories={event.ticketCategories ?? []}
              />
              {totalItems() > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 space-y-3"
                >
                  <div className="flex justify-between text-sm font-medium text-gray-700">
                    <span>Total ({totalItems()} tickets)</span>
                    <span className="text-indigo-600">
                      {formatPrice(totalAmount())}
                    </span>
                  </div>
                  <Button fullWidth onClick={handleBookNow}>
                    {isAuthenticated() ? "Book Now" : "Sign in to Book"}
                  </Button>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>

      <PaymentModal open={showPayment} onClose={() => setShowPayment(false)} />
    </>
  );
}
