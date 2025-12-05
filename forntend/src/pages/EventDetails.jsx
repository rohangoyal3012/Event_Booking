import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { eventService } from "../services/api";
import BookingForm from "../components/BookingForm";
import Button from "../shared/components/Button";
import Card from "../shared/components/Card";
import Badge from "../shared/components/Badge";
import {
  formatDisplayDate,
  formatDisplayTime,
  formatPrice,
} from "../utils/helpers";

const EventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    fetchEvent();

    // Set up polling interval for real-time updates every 5 seconds
    const intervalId = setInterval(() => {
      fetchEvent(true); // Pass true to indicate background refresh
    }, 5000);

    // Cleanup interval on unmount
    return () => clearInterval(intervalId);
  }, [id]);

  const fetchEvent = async (isBackgroundRefresh = false) => {
    try {
      if (!isBackgroundRefresh) {
        setLoading(true);
      } else {
        setIsRefreshing(true);
      }
      setError(null);
      const response = await eventService.getEventById(id);
      setEvent(response.event);
    } catch (err) {
      if (!isBackgroundRefresh) {
        setError(err.error || "Failed to fetch event details");
      }
    } finally {
      if (!isBackgroundRefresh) {
        setLoading(false);
      } else {
        setIsRefreshing(false);
      }
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this event?")) {
      try {
        await eventService.deleteEvent(id);
        navigate("/");
      } catch (err) {
        alert("Failed to delete event: " + (err.error || err.message));
      }
    }
  };

  const handleEdit = () => {
    navigate(`/events/${id}/edit`);
  };

  const handleBookNow = () => {
    setShowBookingForm(true);
  };

  const handleBookingSuccess = (booking) => {
    setShowBookingForm(false);
    // Refresh event data to show updated available seats
    fetchEvent();
    // Navigate to success page
    navigate("/booking-success", { state: { booking } });
  };

  const handleBookingCancel = () => {
    setShowBookingForm(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-dark-600">Loading event details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="text-center max-w-md mx-auto" padding="lg">
          <div className="text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-dark-900 mb-2">
            Error Loading Event
          </h2>
          <p className="text-dark-600 mb-6">{error}</p>
          <Button variant="primary" onClick={() => navigate("/")}>
            Back to Home
          </Button>
        </Card>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="text-center max-w-md mx-auto" padding="lg">
          <div className="text-5xl mb-4">📭</div>
          <h2 className="text-2xl font-bold text-dark-900 mb-2">
            Event Not Found
          </h2>
          <p className="text-dark-600 mb-6">
            The event you're looking for doesn't exist.
          </p>
          <Button variant="primary" onClick={() => navigate("/")}>
            Back to Home
          </Button>
        </Card>
      </div>
    );
  }

  const availabilityPercentage = (event.available_seats / event.capacity) * 100;
  const getStatusVariant = () => {
    if (event.status === "upcoming") return "success";
    if (event.status === "completed") return "default";
    return "danger";
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Real-time Update Indicator */}
        {isRefreshing && (
          <div className="fixed top-20 right-4 z-50 flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-lg border border-primary-200 animate-slide-in">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            <span className="text-sm font-medium text-dark-700">
              Live Updates
            </span>
          </div>
        )}

        <Button variant="ghost" className="mb-6" onClick={() => navigate("/")}>
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back to Events
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Card padding="lg">
              {/* Event Image */}
              <div className="relative h-64 sm:h-80 bg-gradient-primary rounded-xl mb-6 overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-8xl opacity-90">🎭</span>
                </div>
                <div className="absolute top-4 right-4 flex gap-2">
                  <Badge variant={getStatusVariant()}>{event.status}</Badge>
                </div>
              </div>

              {/* Event Title & Description */}
              <h1 className="text-3xl sm:text-4xl font-display font-bold text-dark-900 mb-4">
                {event.title}
              </h1>

              {event.description && (
                <p className="text-dark-600 text-lg mb-6 leading-relaxed">
                  {event.description}
                </p>
              )}

              {/* Event Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg
                      className="w-5 h-5 text-primary-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-dark-500">
                      Date
                    </div>
                    <div className="text-base font-semibold text-dark-900">
                      {formatDisplayDate(event.date)}
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg
                      className="w-5 h-5 text-primary-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-dark-500">
                      Time
                    </div>
                    <div className="text-base font-semibold text-dark-900">
                      {formatDisplayTime(event.time)}
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg sm:col-span-2">
                  <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg
                      className="w-5 h-5 text-primary-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-dark-500">
                      Location
                    </div>
                    <div className="text-base font-semibold text-dark-900">
                      {event.location}
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card padding="lg" className="sticky top-24">
              <h3 className="text-xl font-bold text-dark-900 mb-4">
                Booking Information
              </h3>

              {/* Price */}
              <div className="mb-6">
                <div className="text-sm font-medium text-dark-500 mb-1">
                  Price
                </div>
                <div className="text-3xl font-bold text-primary-600">
                  {formatPrice(event.price)}
                </div>
              </div>

              {/* Availability */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm font-semibold text-dark-700">
                    Availability
                  </span>
                  <span className="text-lg font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                    {event.available_seats}/{event.capacity}
                  </span>
                </div>

                {/* Enhanced Progress Bar */}
                <div className="relative">
                  <div className="w-full h-4 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full overflow-hidden shadow-inner">
                    <div
                      className="h-full bg-gradient-to-r from-purple-500 via-primary-600 to-secondary-500 transition-all duration-700 ease-out relative overflow-hidden"
                      style={{ width: `${availabilityPercentage}%` }}
                    >
                      {/* Animated shine effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-shine"></div>
                    </div>
                  </div>

                  {/* Percentage indicator */}
                  {availabilityPercentage > 15 && (
                    <div
                      className="absolute top-0 h-4 flex items-center justify-center transition-all duration-700"
                      style={{
                        left: `${availabilityPercentage}%`,
                        transform: "translateX(-50%)",
                      }}
                    >
                      <div className="bg-white px-2 py-0.5 rounded-full shadow-lg -mt-8">
                        <span className="text-xs font-bold text-primary-600">
                          {Math.round(availabilityPercentage)}%
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex justify-between items-center mt-2">
                  <p className="text-xs text-dark-500 flex items-center gap-1">
                    <span
                      className={`inline-block w-2 h-2 rounded-full ${
                        availabilityPercentage > 50
                          ? "bg-green-500"
                          : availabilityPercentage > 20
                          ? "bg-yellow-500"
                          : "bg-red-500"
                      } animate-pulse`}
                    ></span>
                    {event.available_seats} seats remaining
                  </p>
                  <p className="text-xs font-medium text-dark-600">
                    {availabilityPercentage > 50
                      ? "🟢 Good"
                      : availabilityPercentage > 20
                      ? "🟡 Limited"
                      : "🔴 Almost Full"}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-3">
                {!isAdmin() &&
                  event.available_seats > 0 &&
                  event.status === "upcoming" && (
                    <Button
                      variant="primary"
                      size="lg"
                      className="w-full"
                      onClick={handleBookNow}
                    >
                      🎟️ Book Tickets Now
                    </Button>
                  )}

                {!isAdmin() && event.available_seats === 0 && (
                  <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4 text-center">
                    <span className="text-2xl block mb-2">❌</span>
                    <p className="text-red-700 font-semibold">Sold Out</p>
                  </div>
                )}

                {isAdmin() && (
                  <>
                    <Button
                      variant="primary"
                      size="lg"
                      className="w-full"
                      onClick={handleEdit}
                    >
                      Edit Event
                    </Button>
                    <Button
                      variant="outline"
                      size="lg"
                      className="w-full text-red-600 border-red-300 hover:bg-red-50"
                      onClick={handleDelete}
                    >
                      Delete Event
                    </Button>
                  </>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Booking Form Modal */}
      {showBookingForm && (
        <BookingForm
          event={event}
          onSuccess={handleBookingSuccess}
          onCancel={handleBookingCancel}
        />
      )}
    </div>
  );
};

export default EventDetails;
