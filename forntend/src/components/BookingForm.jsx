import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { bookingService } from "../services/api";

const BookingForm = ({ event, onSuccess, onCancel }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: user?.username || "",
    email: user?.email || "",
    mobile: "",
    quantity: 1,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Update form data when user is available
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        name: user.username || prev.name,
        email: user.email || prev.email,
      }));
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError(""); // Clear error when user types
  };

  const calculateTotal = () => {
    const basePrice = parseFloat(event.price || 0);
    const dynamicFactor = parseFloat(event.dynamic_pricing_factor || 1.0);
    const quantity = parseInt(formData.quantity) || 0;
    return (basePrice * dynamicFactor * quantity).toFixed(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Validation
      if (!formData.name.trim()) {
        throw new Error("Name is required");
      }
      if (!formData.email.trim()) {
        throw new Error("Email is required");
      }
      if (!formData.mobile.trim()) {
        throw new Error("Mobile number is required");
      }
      if (formData.quantity < 1) {
        throw new Error("Quantity must be at least 1");
      }
      if (formData.quantity > event.available_seats) {
        throw new Error(`Only ${event.available_seats} seats available`);
      }

      const bookingData = {
        event_id: event.id,
        name: formData.name.trim(),
        email: formData.email.trim(),
        mobile: formData.mobile.trim(),
        quantity: parseInt(formData.quantity),
        total_amount: parseFloat(calculateTotal()),
      };

      const response = await bookingService.bookTickets(bookingData);

      if (onSuccess) {
        onSuccess(response.booking);
      }
    } catch (err) {
      setError(err.error || err.message || "Failed to book tickets");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl animate-scale-in">
        <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-4 flex justify-between items-center rounded-t-2xl">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            🎟️ Book Your Tickets
          </h2>
          <button
            onClick={onCancel}
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

        <div className="p-6 bg-gradient-to-r from-purple-50 to-indigo-50 border-b-2 border-purple-200">
          <h3 className="text-xl font-bold text-gray-800 mb-3">
            {event.title}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <p className="flex items-center gap-2 text-gray-700">
              <span>📅</span>
              <span>{event.date}</span>
            </p>
            <p className="flex items-center gap-2 text-gray-700">
              <span>📍</span>
              <span>{event.location}</span>
            </p>
            <p className="flex items-center gap-2 text-gray-700">
              <span>💰</span>
              <span>
                ₹{event.price} per ticket
                {event.dynamic_pricing_factor &&
                  event.dynamic_pricing_factor !== 1 && (
                    <span className="ml-1 text-purple-600 font-semibold">
                      × {event.dynamic_pricing_factor}
                    </span>
                  )}
              </span>
            </p>
            <p className="flex items-center gap-2 text-gray-700">
              <span>👥</span>
              <span>{event.available_seats} seats available</span>
            </p>
          </div>
        </div>

        {error && (
          <div className="mx-6 mt-6 p-4 bg-red-100 border-2 border-red-300 rounded-xl text-red-700 flex items-center gap-3">
            <span className="text-xl">⚠️</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-semibold text-gray-700 mb-2"
            >
              Full Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your full name"
              required
              disabled={loading}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 focus:shadow-lg disabled:bg-gray-100 disabled:cursor-not-allowed transition-all duration-300"
            />
          </div>

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-semibold text-gray-700 mb-2"
            >
              Email Address *
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="your.email@example.com"
              required
              disabled={loading}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 focus:shadow-lg disabled:bg-gray-100 disabled:cursor-not-allowed transition-all duration-300"
            />
          </div>

          <div>
            <label
              htmlFor="mobile"
              className="block text-sm font-semibold text-gray-700 mb-2"
            >
              Mobile Number *
            </label>
            <input
              type="tel"
              id="mobile"
              name="mobile"
              value={formData.mobile}
              onChange={handleChange}
              placeholder="+1234567890"
              required
              disabled={loading}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 focus:shadow-lg disabled:bg-gray-100 disabled:cursor-not-allowed transition-all duration-300"
            />
          </div>

          <div>
            <label
              htmlFor="quantity"
              className="block text-sm font-semibold text-gray-700 mb-2"
            >
              Number of Tickets *
            </label>
            <input
              type="number"
              id="quantity"
              name="quantity"
              value={formData.quantity}
              onChange={handleChange}
              min="1"
              max={event.available_seats}
              required
              disabled={loading}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 focus:shadow-lg disabled:bg-gray-100 disabled:cursor-not-allowed transition-all duration-300"
            />
          </div>

          <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-4 rounded-xl border-2 border-purple-200">
            <div className="flex justify-between items-center">
              <span className="text-gray-700 font-semibold">Total Amount:</span>
              <span className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                ₹{calculateTotal()}
              </span>
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className="flex-1 py-3 px-6 bg-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 px-6 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-xl hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none transition-all duration-300"
            >
              {loading ? "Booking..." : "Confirm Booking"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BookingForm;
