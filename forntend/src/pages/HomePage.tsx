import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  ArrowRightIcon,
  CalendarDaysIcon,
  SparklesIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";
import EventCard from "@/features/events/EventCard";
import { EventCardSkeleton, Button } from "@/components/ui";
import { eventsService } from "@/services/events.service";
import { queryKeys } from "@/lib/queryClient";
import { ROUTES } from "@/utils/constants";

export default function HomePage() {
  const { data: featuredData, isLoading } = useQuery({
    queryKey: queryKeys.events.featured,
    queryFn: () => eventsService.getFeatured(6),
  });

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-900 via-indigo-800 to-purple-900 pb-24 pt-20 text-white">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "radial-gradient(circle at 25% 25%, white 1px, transparent 1px), radial-gradient(circle at 75% 75%, white 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
        <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm font-medium backdrop-blur-sm mb-6">
              <SparklesIcon className="h-4 w-4 text-yellow-300" />
              Discover amazing events
            </span>
            <h1 className="text-5xl font-extrabold leading-tight sm:text-6xl">
              Find & Book Events{" "}
              <span className="bg-gradient-to-r from-yellow-300 to-orange-400 bg-clip-text text-transparent">
                You'll Love
              </span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-indigo-200">
              From concerts to tech conferences — discover thousands of events,
              book tickets instantly, and make memories that last.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Button
                size="lg"
                variant="primary"
                className="bg-white !text-indigo-700 hover:bg-indigo-50"
              >
                <Link to={ROUTES.EVENTS} className="flex items-center gap-2">
                  Explore Events
                  <ArrowRightIcon className="h-5 w-5" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="ghost"
                className="border border-white/30 text-white hover:bg-white/10"
              >
                <Link to={ROUTES.REGISTER}>Create an Event</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="border-b border-gray-100 bg-white">
        <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
          <div className="grid grid-cols-3 gap-6 text-center">
            {[
              { value: "10,000+", label: "Events Listed" },
              { value: "500K+", label: "Happy Attendees" },
              { value: "1,200+", label: "Organisers" },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="text-3xl font-extrabold text-indigo-600">
                  {stat.value}
                </p>
                <p className="text-sm text-gray-500">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured events */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Featured Events
            </h2>
            <p className="text-gray-500">
              Handpicked events you won't want to miss
            </p>
          </div>
          <Link
            to={ROUTES.EVENTS}
            className="flex items-center gap-1 text-sm font-medium text-indigo-600 hover:text-indigo-700"
          >
            View all <ArrowRightIcon className="h-4 w-4" />
          </Link>
        </div>
        {isLoading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <EventCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featuredData?.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </section>

      {/* Value props */}
      <section className="bg-gray-50 py-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <h2 className="mb-10 text-center text-2xl font-bold text-gray-900">
            Why EventBook?
          </h2>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
            {[
              {
                icon: <CalendarDaysIcon className="h-7 w-7" />,
                title: "Instant Booking",
                desc: "Book tickets in seconds with our streamlined checkout.",
              },
              {
                icon: <ShieldCheckIcon className="h-7 w-7" />,
                title: "Secure Payments",
                desc: "PCI-DSS compliant payments via Razorpay. Your data is safe.",
              },
              {
                icon: <SparklesIcon className="h-7 w-7" />,
                title: "QR Tickets",
                desc: "Digital tickets delivered instantly. No printing needed.",
              },
            ].map((feat) => (
              <div
                key={feat.title}
                className="flex flex-col items-center text-center"
              >
                <div className="mb-4 rounded-xl bg-indigo-100 p-4 text-indigo-600">
                  {feat.icon}
                </div>
                <h3 className="mb-2 font-semibold text-gray-900">
                  {feat.title}
                </h3>
                <p className="text-sm text-gray-500">{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
