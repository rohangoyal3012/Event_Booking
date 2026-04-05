import { useEffect } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircleIcon } from "@heroicons/react/24/solid";
import { Button } from "@/components/ui";
import { ROUTES } from "@/utils/constants";

export default function BookingSuccessPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { bookingRef } = (location.state ?? {}) as { bookingRef?: string };

  // Redirect if arrived without booking ref
  useEffect(() => {
    if (!bookingRef) navigate(ROUTES.HOME, { replace: true });
  }, [bookingRef, navigate]);

  if (!bookingRef) return null;

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, type: "spring" }}
        className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-green-50"
        >
          <CheckCircleIcon className="h-14 w-14 text-green-500" />
        </motion.div>

        <h1 className="text-2xl font-bold text-gray-900">Booking Confirmed!</h1>
        <p className="mt-2 text-gray-500">
          Your booking has been confirmed and tickets have been emailed to you.
        </p>

        <div className="mt-6 rounded-xl bg-gray-50 p-4">
          <p className="text-xs font-medium uppercase tracking-wider text-gray-400">
            Booking Reference
          </p>
          <p className="mt-1 text-xl font-bold text-indigo-600 font-mono">
            {bookingRef}
          </p>
        </div>

        <p className="mt-4 text-sm text-gray-500">
          Check your email for QR ticket codes. You'll need these for entry.
        </p>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Button
            fullWidth
            variant="outline"
            as={Link as never}
            to={ROUTES.MY_BOOKINGS}
          >
            <Link to={ROUTES.MY_BOOKINGS} className="w-full">
              View my bookings
            </Link>
          </Button>
          <Button fullWidth>
            <Link to={ROUTES.EVENTS} className="w-full">
              Explore more events
            </Link>
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
