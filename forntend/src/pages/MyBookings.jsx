import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { bookingService } from "../services/api";
import { motion } from "framer-motion";

const MyBookings = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancellingId, setCancellingId] = useState(null);
  const [filter, setFilter] = useState("all"); // all, upcoming, cancelled

  useEffect(() => {
    fetchBookings();
  }, [user]);

  const fetchBookings = async () => {
    if (!user?.email) {
      setError("Please log in to view your bookings");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const data = await bookingService.getBookingsByEmail(user.email);
      setBookings(data.bookings || []);
      setError("");
    } catch (err) {
      setError(err.error || "Failed to load bookings");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm("Are you sure you want to cancel this booking?")) {
      return;
    }

    try {
      setCancellingId(bookingId);
      await bookingService.cancelBooking(bookingId);
      await fetchBookings(); // Refresh the list
    } catch (err) {
      alert(err.error || "Failed to cancel booking");
    } finally {
      setCancellingId(null);
    }
  };

  const filteredBookings = bookings.filter((booking) => {
    if (filter === "all") return true;
    if (filter === "upcoming") return booking.status === "confirmed";
    if (filter === "cancelled") return booking.status === "cancelled";
    return true;
  });

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-700 border-green-300";
      case "cancelled":
        return "bg-red-100 text-red-700 border-red-300";
      case "pending":
        return "bg-yellow-100 text-yellow-700 border-yellow-300";
      default:
        return "bg-gray-100 text-gray-700 border-gray-300";
    }
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-70px)] flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-200">
        <div className="text-center">
          <div className="inline-block w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
          <p className="mt-4 text-lg text-gray-700 font-medium">
            Loading your bookings...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-70px)] bg-gradient-to-br from-gray-50 to-gray-200 p-4 sm:p-6 lg:p-10">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent mb-2">
            My Bookings
          </h1>
          <p className="text-gray-600 text-lg">
            View and manage your event bookings
          </p>
          {/* Debug info - Remove after testing */}
          {user && (
            <div className="mt-2 text-xs text-gray-500">
              Logged in as: {user.email || "No email"} | ID:{" "}
              {user.id || "No ID"}
            </div>
          )}
        </motion.div>

        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-6 p-4 bg-red-100 border-2 border-red-300 rounded-xl text-red-700 flex items-center gap-3"
          >
            <span className="text-xl">⚠️</span>
            <span>{error}</span>
          </motion.div>
        )}

        {!error && (
          <>
            <div className="flex flex-wrap gap-3 mb-8 justify-center">
              <button
                className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2 ${
                  filter === "all"
                    ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg"
                    : "bg-white text-gray-700 hover:bg-gray-50 border-2 border-gray-200"
                }`}
                onClick={() => setFilter("all")}
              >
                All Bookings
                <span
                  className={`px-2 py-0.5 rounded-full text-sm ${
                    filter === "all"
                      ? "bg-white/30"
                      : "bg-purple-100 text-purple-700"
                  }`}
                >
                  {bookings.length}
                </span>
              </button>
              <button
                className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2 ${
                  filter === "upcoming"
                    ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg"
                    : "bg-white text-gray-700 hover:bg-gray-50 border-2 border-gray-200"
                }`}
                onClick={() => setFilter("upcoming")}
              >
                Upcoming
                <span
                  className={`px-2 py-0.5 rounded-full text-sm ${
                    filter === "upcoming"
                      ? "bg-white/30"
                      : "bg-green-100 text-green-700"
                  }`}
                >
                  {bookings.filter((b) => b.status === "confirmed").length}
                </span>
              </button>
              <button
                className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2 ${
                  filter === "cancelled"
                    ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg"
                    : "bg-white text-gray-700 hover:bg-gray-50 border-2 border-gray-200"
                }`}
                onClick={() => setFilter("cancelled")}
              >
                Cancelled
                <span
                  className={`px-2 py-0.5 rounded-full text-sm ${
                    filter === "cancelled"
                      ? "bg-white/30"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {bookings.filter((b) => b.status === "cancelled").length}
                </span>
              </button>
            </div>

            {filteredBookings.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-16 bg-white rounded-2xl shadow-lg"
              >
                <div className="text-8xl mb-6">🎫</div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">
                  No bookings found
                </h3>
                <p className="text-gray-600 mb-6">
                  {filter === "all"
                    ? "You haven't booked any events yet"
                    : `No ${filter} bookings`}
                </p>
                <a
                  href="/"
                  className="inline-block px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-xl hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
                >
                  Browse Events
                </a>
              </motion.div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredBookings.map((booking, index) => (
                  <motion.div
                    key={booking.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden"
                  >
                    <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-4 flex justify-between items-center">
                      <div className="text-white font-semibold">
                        Booking #{booking.id}
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-semibold border-2 ${getStatusBadgeClass(
                          booking.status
                        )}`}
                      >
                        {booking.status}
                      </span>
                    </div>

                    <div className="p-6">
                      <h3 className="text-2xl font-bold text-gray-800 mb-4">
                        {booking.event_title}
                      </h3>

                      <div className="space-y-3">
                        <div className="flex items-start gap-3">
                          <span className="text-2xl">📅</span>
                          <div className="flex-1">
                            <span className="block text-sm text-gray-500 font-medium">
                              Event Date
                            </span>
                            <span className="block text-gray-800 font-semibold">
                              {new Date(booking.event_date).toLocaleDateString(
                                "en-US",
                                {
                                  weekday: "short",
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                }
                              )}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-start gap-3">
                          <span className="text-2xl">🎫</span>
                          <div className="flex-1">
                            <span className="block text-sm text-gray-500 font-medium">
                              Tickets
                            </span>
                            <span className="block text-gray-800 font-semibold">
                              {booking.quantity} ticket
                              {booking.quantity > 1 ? "s" : ""}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-start gap-3">
                          <span className="text-2xl">💰</span>
                          <div className="flex-1">
                            <span className="block text-sm text-gray-500 font-medium">
                              Total Amount
                            </span>
                            <span className="block text-gray-800 font-semibold">
                              ₹{booking.total_amount}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-start gap-3">
                          <span className="text-2xl">📧</span>
                          <div className="flex-1">
                            <span className="block text-sm text-gray-500 font-medium">
                              Contact Email
                            </span>
                            <span className="block text-gray-800 break-all">
                              {booking.email}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-start gap-3">
                          <span className="text-2xl">📱</span>
                          <div className="flex-1">
                            <span className="block text-sm text-gray-500 font-medium">
                              Mobile
                            </span>
                            <span className="block text-gray-800">
                              {booking.mobile}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-start gap-3">
                          <span className="text-2xl">🕐</span>
                          <div className="flex-1">
                            <span className="block text-sm text-gray-500 font-medium">
                              Booked On
                            </span>
                            <span className="block text-gray-800">
                              {new Date(
                                booking.booking_date
                              ).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              })}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="px-6 pb-6">
                      {booking.status === "confirmed" && (
                        <button
                          className="w-full py-3 px-6 bg-red-500 text-white font-semibold rounded-xl hover:bg-red-600 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none transition-all duration-300"
                          onClick={() => handleCancelBooking(booking.id)}
                          disabled={cancellingId === booking.id}
                        >
                          {cancellingId === booking.id
                            ? "Cancelling..."
                            : "Cancel Booking"}
                        </button>
                      )}
                      {booking.status === "cancelled" && (
                        <div className="text-center py-3 bg-red-50 text-red-700 rounded-xl font-medium">
                          This booking has been cancelled
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default MyBookings;
