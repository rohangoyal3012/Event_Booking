import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { bookingService, eventService } from "../services/api";

const AdminDashboard = () => {
  const [bookings, setBookings] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [actionLoading, setActionLoading] = useState(null);
  const [showAllBookingsModal, setShowAllBookingsModal] = useState(false);
  const itemsPerPage = 10;
  const [stats, setStats] = useState({
    totalBookings: 0,
    totalRevenue: 0,
    confirmedBookings: 0,
    cancelledBookings: 0,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [bookingsResponse, eventsResponse] = await Promise.all([
        bookingService.getAllBookings(),
        eventService.getAllEvents(),
      ]);

      // Handle both array and object responses
      const bookingsData = Array.isArray(bookingsResponse)
        ? bookingsResponse
        : bookingsResponse.bookings || [];
      setBookings(bookingsData);
      setEvents(eventsResponse.events || []);
      calculateStats(bookingsData);
    } catch (err) {
      setError(err.error || "Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (bookingsData) => {
    const stats = {
      totalBookings: bookingsData.length,
      totalRevenue: bookingsData
        .filter((b) => b.status === "confirmed")
        .reduce((sum, b) => sum + parseFloat(b.total_amount || 0), 0),
      confirmedBookings: bookingsData.filter((b) => b.status === "confirmed")
        .length,
      cancelledBookings: bookingsData.filter((b) => b.status === "cancelled")
        .length,
    };
    setStats(stats);
  };

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm("Are you sure you want to cancel this booking?")) {
      return;
    }

    try {
      setActionLoading(bookingId);
      await bookingService.cancelBooking(bookingId);
      await fetchData(); // Refresh data
    } catch (err) {
      alert("Failed to cancel booking: " + (err.error || err.message));
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteBooking = async (bookingId) => {
    if (!window.confirm("Are you sure you want to delete this booking?")) {
      return;
    }

    try {
      setActionLoading(bookingId);
      await bookingService.deleteBooking(bookingId);
      await fetchData(); // Refresh data
    } catch (err) {
      alert("Failed to delete booking: " + (err.error || err.message));
    } finally {
      setActionLoading(null);
    }
  };

  const filteredBookings = bookings.filter((booking) => {
    const matchesEvent =
      selectedEvent === "all" || booking.event_id === parseInt(selectedEvent);
    const matchesStatus =
      statusFilter === "all" || booking.status === statusFilter;
    const matchesSearch =
      searchTerm === "" ||
      booking.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.mobile.includes(searchTerm) ||
      (booking.event_title &&
        booking.event_title.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesEvent && matchesStatus && matchesSearch;
  });

  const totalPages = Math.ceil(filteredBookings.length / itemsPerPage);
  const paginatedBookings = filteredBookings.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-70px)] bg-gradient-to-br from-gray-50 to-gray-200 p-10">
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mb-5"></div>
          <p className="text-purple-600 font-semibold text-lg">
            Loading dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-70px)] bg-gradient-to-br from-gray-50 to-gray-200 p-10">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-center mb-10 p-8 bg-white rounded-2xl shadow-lg"
        >
          <div>
            <h1 className="text-4xl font-extrabold text-gray-900 mb-2 tracking-tight">
              📊 Admin Dashboard
            </h1>
            <p className="text-lg text-gray-600">
              Manage all bookings and view statistics
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowAllBookingsModal(true)}
              className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-xl hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
            >
              📋 View All Bookings
            </button>
            <button
              onClick={fetchData}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-xl hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
            >
              🔄 Refresh
            </button>
          </div>
        </motion.div>

        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-3 p-4 mb-8 bg-red-100 border-2 border-red-300 text-red-900 rounded-xl font-medium"
          >
            <span className="text-2xl">⚠️</span>
            <span className="flex-1">{error}</span>
            <button
              onClick={fetchData}
              className="px-4 py-2 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 transition-colors duration-300"
            >
              Retry
            </button>
          </motion.div>
        )}

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-white p-7 rounded-2xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border-l-4 border-purple-500"
          >
            <div className="flex items-center gap-5">
              <div className="text-5xl">📝</div>
              <div>
                <div className="text-3xl font-extrabold text-gray-900">
                  {stats.totalBookings}
                </div>
                <div className="text-sm text-gray-600 font-semibold uppercase tracking-wide mt-1">
                  Total Bookings
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-white p-7 rounded-2xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border-l-4 border-green-500"
          >
            <div className="flex items-center gap-5">
              <div className="text-5xl">💰</div>
              <div>
                <div className="text-3xl font-extrabold text-gray-900">
                  ₹{stats.totalRevenue.toFixed(2)}
                </div>
                <div className="text-sm text-gray-600 font-semibold uppercase tracking-wide mt-1">
                  Total Revenue
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-white p-7 rounded-2xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border-l-4 border-blue-500"
          >
            <div className="flex items-center gap-5">
              <div className="text-5xl">✅</div>
              <div>
                <div className="text-3xl font-extrabold text-gray-900">
                  {stats.confirmedBookings}
                </div>
                <div className="text-sm text-gray-600 font-semibold uppercase tracking-wide mt-1">
                  Confirmed
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="bg-white p-7 rounded-2xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border-l-4 border-red-500"
          >
            <div className="flex items-center gap-5">
              <div className="text-5xl">❌</div>
              <div>
                <div className="text-3xl font-extrabold text-gray-900">
                  {stats.cancelledBookings}
                </div>
                <div className="text-sm text-gray-600 font-semibold uppercase tracking-wide mt-1">
                  Cancelled
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Filters and Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white p-6 rounded-2xl shadow-lg mb-8 flex flex-col lg:flex-row gap-5 items-stretch lg:items-center"
        >
          <div className="flex-1 relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl">
              🔍
            </span>
            <input
              type="text"
              placeholder="Search by name, email, mobile, or event..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-14 pr-4 py-3.5 border-2 border-gray-200 rounded-xl text-base transition-all duration-300 focus:outline-none focus:border-purple-500 focus:shadow-lg focus:shadow-purple-100"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <select
              value={selectedEvent}
              onChange={(e) => {
                setSelectedEvent(e.target.value);
                setCurrentPage(1);
              }}
              className="px-4 py-3.5 border-2 border-gray-200 rounded-xl font-medium text-gray-700 bg-white cursor-pointer transition-all duration-300 hover:border-purple-500 focus:outline-none focus:border-purple-500 focus:shadow-lg focus:shadow-purple-100 min-w-[160px]"
            >
              <option value="all">All Events</option>
              {events.map((event) => (
                <option key={event.id} value={event.id}>
                  {event.title}
                </option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-4 py-3.5 border-2 border-gray-200 rounded-xl font-medium text-gray-700 bg-white cursor-pointer transition-all duration-300 hover:border-purple-500 focus:outline-none focus:border-purple-500 focus:shadow-lg focus:shadow-purple-100 min-w-[160px]"
            >
              <option value="all">All Status</option>
              <option value="confirmed">Confirmed</option>
              <option value="cancelled">Cancelled</option>
              <option value="pending">Pending</option>
            </select>
          </div>
        </motion.div>

        {/* Bookings Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-2xl shadow-lg overflow-hidden"
        >
          <div className="p-6 bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900">
              Bookings ({filteredBookings.length})
            </h2>
          </div>

          {filteredBookings.length === 0 ? (
            <div className="text-center py-20 px-5">
              <div className="text-7xl mb-5 opacity-50">📭</div>
              <h3 className="text-2xl text-gray-700 mb-3">No bookings found</h3>
              <p className="text-lg text-gray-500">
                Try adjusting your filters or search criteria
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b-2 border-gray-200">
                    <tr>
                      <th className="px-5 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider whitespace-nowrap">
                        ID
                      </th>
                      <th className="px-5 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider whitespace-nowrap">
                        Event
                      </th>
                      <th className="px-5 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider whitespace-nowrap">
                        Customer
                      </th>
                      <th className="px-5 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider whitespace-nowrap">
                        Contact
                      </th>
                      <th className="px-5 py-4 text-center text-xs font-bold text-gray-600 uppercase tracking-wider whitespace-nowrap">
                        Qty
                      </th>
                      <th className="px-5 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider whitespace-nowrap">
                        Amount
                      </th>
                      <th className="px-5 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider whitespace-nowrap">
                        Date
                      </th>
                      <th className="px-5 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider whitespace-nowrap">
                        Status
                      </th>
                      <th className="px-5 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider whitespace-nowrap">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <AnimatePresence>
                      {paginatedBookings.map((booking, index) => (
                        <motion.tr
                          key={booking.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          transition={{ delay: index * 0.05 }}
                          className="border-b border-gray-100 hover:bg-gray-50 transition-colors duration-200"
                        >
                          <td className="px-5 py-5 text-sm font-bold text-purple-600">
                            #{booking.id}
                          </td>
                          <td className="px-5 py-5 text-sm font-semibold text-gray-900">
                            {booking.event_title || "N/A"}
                          </td>
                          <td className="px-5 py-5 text-sm text-gray-700">
                            {booking.name}
                          </td>
                          <td className="px-5 py-5 text-sm">
                            <div className="flex flex-col gap-1">
                              <div className="text-gray-700 font-medium">
                                {booking.email}
                              </div>
                              <div className="text-gray-500 text-xs">
                                {booking.mobile}
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-5 text-center">
                            <span className="inline-block px-3 py-1 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-full font-semibold text-sm">
                              {booking.quantity}
                            </span>
                          </td>
                          <td className="px-5 py-5 text-sm font-bold text-green-600">
                            ₹{booking.total_amount}
                          </td>
                          <td className="px-5 py-5 text-sm text-gray-600">
                            {new Date(booking.booking_date).toLocaleDateString(
                              "en-US",
                              {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              }
                            )}
                          </td>
                          <td className="px-5 py-5">
                            <span
                              className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                                booking.status === "confirmed"
                                  ? "bg-green-100 text-green-800"
                                  : booking.status === "cancelled"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-yellow-100 text-yellow-800"
                              }`}
                            >
                              {booking.status}
                            </span>
                          </td>
                          <td className="px-5 py-5">
                            <div className="flex gap-2">
                              {booking.status === "confirmed" && (
                                <button
                                  onClick={() =>
                                    handleCancelBooking(booking.id)
                                  }
                                  disabled={actionLoading === booking.id}
                                  className="px-3 py-1 bg-yellow-100 text-yellow-800 border border-yellow-300 rounded-lg text-sm font-semibold hover:bg-yellow-200 hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                  title="Cancel booking"
                                >
                                  {actionLoading === booking.id
                                    ? "..."
                                    : "Cancel"}
                                </button>
                              )}
                              <button
                                onClick={() => handleDeleteBooking(booking.id)}
                                disabled={actionLoading === booking.id}
                                className="px-3 py-1 bg-red-100 text-red-800 border border-red-300 rounded-lg text-sm font-semibold hover:bg-red-200 hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                title="Delete booking"
                              >
                                {actionLoading === booking.id
                                  ? "..."
                                  : "Delete"}
                              </button>
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 p-6 bg-gray-50 border-t-2 border-gray-200">
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(1, prev - 1))
                    }
                    disabled={currentPage === 1}
                    className="w-full sm:w-auto px-5 py-2.5 bg-white border-2 border-gray-300 rounded-xl text-sm font-semibold text-gray-700 hover:border-purple-500 hover:text-purple-600 hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                  >
                    ← Previous
                  </button>

                  <div className="text-sm text-gray-600 font-semibold">
                    Page {currentPage} of {totalPages}
                  </div>

                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                    }
                    disabled={currentPage === totalPages}
                    className="w-full sm:w-auto px-5 py-2.5 bg-white border-2 border-gray-300 rounded-xl text-sm font-semibold text-gray-700 hover:border-purple-500 hover:text-purple-600 hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                  >
                    Next →
                  </button>
                </div>
              )}
            </>
          )}
        </motion.div>

        {/* All Bookings Modal */}
        {showAllBookingsModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-2xl w-full max-w-7xl max-h-[90vh] overflow-hidden shadow-2xl"
            >
              <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-4 flex justify-between items-center">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  📋 All Bookings Details
                </h2>
                <button
                  onClick={() => setShowAllBookingsModal(false)}
                  className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors duration-300"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
                {bookings.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="text-7xl mb-4">📭</div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-2">
                      No Bookings Found
                    </h3>
                    <p className="text-gray-600">
                      There are no bookings in the system yet.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b-2 border-gray-200">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase">
                            ID
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase">
                            Event
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase">
                            Customer Name
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase">
                            Email
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase">
                            Mobile
                          </th>
                          <th className="px-4 py-3 text-center text-xs font-bold text-gray-600 uppercase">
                            Qty
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase">
                            Amount
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase">
                            Booking Date
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {bookings.map((booking, index) => (
                          <tr
                            key={booking.id}
                            className={`border-b border-gray-100 hover:bg-gray-50 ${
                              index % 2 === 0 ? "bg-white" : "bg-gray-50"
                            }`}
                          >
                            <td className="px-4 py-4 text-sm font-bold text-purple-600">
                              #{booking.id}
                            </td>
                            <td className="px-4 py-4 text-sm font-semibold text-gray-900">
                              {booking.event_title || "N/A"}
                            </td>
                            <td className="px-4 py-4 text-sm text-gray-700">
                              {booking.name}
                            </td>
                            <td className="px-4 py-4 text-sm text-blue-600">
                              <a
                                href={`mailto:${booking.email}`}
                                className="hover:underline"
                              >
                                {booking.email}
                              </a>
                            </td>
                            <td className="px-4 py-4 text-sm text-gray-600">
                              <a
                                href={`tel:${booking.mobile}`}
                                className="hover:underline"
                              >
                                {booking.mobile}
                              </a>
                            </td>
                            <td className="px-4 py-4 text-center">
                              <span className="inline-block px-3 py-1 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-full font-semibold text-sm">
                                {booking.quantity}
                              </span>
                            </td>
                            <td className="px-4 py-4 text-sm font-bold text-green-600">
                              ₹{booking.total_amount}
                            </td>
                            <td className="px-4 py-4 text-sm text-gray-600">
                              {new Date(
                                booking.booking_date
                              ).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </td>
                            <td className="px-4 py-4">
                              <span
                                className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                                  booking.status === "confirmed"
                                    ? "bg-green-100 text-green-800"
                                    : booking.status === "cancelled"
                                    ? "bg-red-100 text-red-800"
                                    : "bg-yellow-100 text-yellow-800"
                                }`}
                              >
                                {booking.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <div className="mt-6 p-4 bg-gray-50 rounded-xl">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                        <div>
                          <div className="text-2xl font-bold text-gray-900">
                            {bookings.length}
                          </div>
                          <div className="text-sm text-gray-600">
                            Total Bookings
                          </div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-green-600">
                            ₹
                            {bookings
                              .filter((b) => b.status === "confirmed")
                              .reduce(
                                (sum, b) =>
                                  sum + parseFloat(b.total_amount || 0),
                                0
                              )
                              .toFixed(2)}
                          </div>
                          <div className="text-sm text-gray-600">
                            Total Revenue
                          </div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-blue-600">
                            {
                              bookings.filter((b) => b.status === "confirmed")
                                .length
                            }
                          </div>
                          <div className="text-sm text-gray-600">Confirmed</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-red-600">
                            {
                              bookings.filter((b) => b.status === "cancelled")
                                .length
                            }
                          </div>
                          <div className="text-sm text-gray-600">Cancelled</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
