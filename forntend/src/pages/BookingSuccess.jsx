import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";

const BookingSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const booking = location.state?.booking;

  useEffect(() => {
    // Fire confetti animation
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    function randomInRange(min, max) {
      return Math.random() * (max - min) + min;
    }

    const interval = setInterval(function () {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);

      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
      });
    }, 250);

    return () => clearInterval(interval);
  }, []);

  if (!booking) {
    return (
      <div className="min-h-[calc(100vh-70px)] flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-200 p-4">
        <div className="text-center">
          <div className="mb-6 text-red-500 text-6xl">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            No booking information found
          </h2>
          <button
            onClick={() => navigate("/")}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-xl hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-70px)] flex items-center justify-center bg-gradient-to-br from-purple-50 via-indigo-50 to-purple-100 p-4">
      <div className="w-full max-w-3xl">
        <motion.div
          className="bg-white rounded-2xl p-8 sm:p-12 shadow-2xl"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <motion.div
            className="w-24 h-24 mx-auto mb-6 bg-gradient-to-r from-green-400 to-green-600 rounded-full flex items-center justify-center"
            initial={{ scale: 0 }}
            animate={{ scale: 1, rotate: 360 }}
            transition={{ delay: 0.2, duration: 0.8, ease: "easeOut" }}
          >
            <svg
              className="w-16 h-16 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={3}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </motion.div>

          <motion.h1
            className="text-4xl font-bold text-center mb-4 bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            Booking Confirmed!
          </motion.h1>

          <motion.p
            className="text-center text-gray-600 mb-8 text-lg"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            Your tickets have been successfully booked. We've sent a
            confirmation email to{" "}
            <strong className="text-purple-600">{booking.email}</strong>
          </motion.p>

          <motion.div
            className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-6 mb-6 border-2 border-purple-200"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Booking Details
            </h2>

            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-purple-200">
                <span className="text-gray-600 font-medium">Booking ID:</span>
                <span className="text-gray-800 font-semibold">
                  #{booking.id}
                </span>
              </div>

              <div className="flex justify-between items-center py-2 border-b border-purple-200">
                <span className="text-gray-600 font-medium">Event:</span>
                <span className="text-gray-800 font-semibold">
                  {booking.event_title}
                </span>
              </div>

              <div className="flex justify-between items-center py-2 border-b border-purple-200">
                <span className="text-gray-600 font-medium">Name:</span>
                <span className="text-gray-800 font-semibold">
                  {booking.name}
                </span>
              </div>

              <div className="flex justify-between items-center py-2 border-b border-purple-200">
                <span className="text-gray-600 font-medium">Mobile:</span>
                <span className="text-gray-800 font-semibold">
                  {booking.mobile}
                </span>
              </div>

              <div className="flex justify-between items-center py-2 border-b border-purple-200">
                <span className="text-gray-600 font-medium">
                  Number of Tickets:
                </span>
                <span className="text-gray-800 font-semibold">
                  {booking.quantity}
                </span>
              </div>

              <div className="flex justify-between items-center py-3 border-t-2 border-purple-300">
                <span className="text-gray-800 font-bold text-lg">
                  Total Amount:
                </span>
                <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                  ₹{booking.total_amount}
                </span>
              </div>

              <div className="flex justify-between items-center py-2">
                <span className="text-gray-600 font-medium">Status:</span>
                <span className="px-4 py-1 bg-green-100 text-green-700 border-2 border-green-300 rounded-full text-sm font-semibold">
                  {booking.status}
                </span>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="text-center mb-8 bg-white rounded-xl p-6 border-2 border-dashed border-purple-300"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            <div className="w-32 h-32 mx-auto mb-4 bg-gradient-to-r from-purple-100 to-indigo-100 rounded-xl flex items-center justify-center">
              <div className="text-center">
                <p className="text-purple-600 font-bold text-lg">QR Code</p>
                <p className="text-gray-600 text-sm">#{booking.id}</p>
              </div>
            </div>
            <p className="text-gray-600 text-sm">
              Show this QR code at the event entrance
            </p>
          </motion.div>

          <motion.div
            className="flex flex-col sm:flex-row gap-4"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            <button
              onClick={() => navigate(`/events/${booking.event_id}`)}
              className="flex-1 py-3 px-6 bg-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-300 transition-colors duration-300"
            >
              View Event Details
            </button>
            <button
              onClick={() => navigate("/")}
              className="flex-1 py-3 px-6 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-xl hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
            >
              Browse More Events
            </button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default BookingSuccess;
