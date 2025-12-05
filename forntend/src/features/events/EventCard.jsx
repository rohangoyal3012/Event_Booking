import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Card from "../../shared/components/Card";
import Button from "../../shared/components/Button";
import Badge from "../../shared/components/Badge";
import BookingForm from "../../components/BookingForm";

const EventCard = ({ event, onBookingSuccess }) => {
  const navigate = useNavigate();
  const [showBookingForm, setShowBookingForm] = useState(false);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return "";
    const [hours, minutes] = timeString.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const availabilityPercentage = (event.available_seats / event.capacity) * 100;

  const getStatusBadge = () => {
    if (event.status === "upcoming") {
      return <Badge variant="success">Upcoming</Badge>;
    } else if (event.status === "completed") {
      return <Badge variant="default">Completed</Badge>;
    } else if (event.status === "cancelled") {
      return <Badge variant="danger">Cancelled</Badge>;
    }
    return null;
  };

  const getAvailabilityColor = () => {
    if (availabilityPercentage > 50) return "text-green-600";
    if (availabilityPercentage > 20) return "text-yellow-600";
    return "text-red-600";
  };

  const handleBookNow = () => {
    setShowBookingForm(true);
  };

  const handleBookingSuccess = (booking) => {
    setShowBookingForm(false);
    // Call parent callback if provided
    if (onBookingSuccess) {
      onBookingSuccess();
    }
    // Navigate to success page
    navigate("/booking-success", { state: { booking } });
  };

  const handleBookingCancel = () => {
    setShowBookingForm(false);
  };

  return (
    <>
      <Card hover className="group overflow-hidden">
        <div className="flex flex-col h-full">
          {/* Event Image/Header */}
          <div className="relative h-48 bg-gradient-primary rounded-lg mb-4 overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-6xl opacity-90">🎭</span>
            </div>
            <div className="absolute top-4 right-4">{getStatusBadge()}</div>
            <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2">
              <div className="text-2xl font-bold text-dark-900">
                {new Date(event.date).getDate()}
              </div>
              <div className="text-xs font-medium text-dark-600">
                {new Date(event.date).toLocaleDateString("en-US", {
                  month: "short",
                })}
              </div>
            </div>
          </div>

          {/* Event Details */}
          <div className="flex-1">
            <h3 className="text-xl font-bold text-dark-900 mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors">
              {event.title}
            </h3>

            <p className="text-dark-600 mb-4 line-clamp-2 text-sm">
              {event.description}
            </p>

            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-sm text-dark-600">
                <svg
                  className="w-5 h-5 text-primary-500"
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
                <span>{formatDate(event.date)}</span>
              </div>

              <div className="flex items-center gap-2 text-sm text-dark-600">
                <svg
                  className="w-5 h-5 text-primary-500"
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
                <span>{formatTime(event.time)}</span>
              </div>

              <div className="flex items-center gap-2 text-sm text-dark-600">
                <svg
                  className="w-5 h-5 text-primary-500"
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
                <span className="line-clamp-1">{event.location}</span>
              </div>
            </div>

            {/* Availability */}
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-dark-700">
                  Availability
                </span>
                <span className={`text-sm font-bold ${getAvailabilityColor()}`}>
                  {event.available_seats}/{event.capacity}
                </span>
              </div>
              <div className="w-full h-2 bg-dark-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-primary transition-all duration-500"
                  style={{ width: `${availabilityPercentage}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2">
            <Button
              variant="primary"
              className="w-full"
              onClick={() => navigate(`/events/${event.id}`)}
              disabled={
                event.available_seats === 0 || event.status !== "upcoming"
              }
            >
              {event.available_seats === 0 ? "Sold Out" : "View Details"}
            </Button>
            <Button
              variant="secondary"
              className="w-full"
              onClick={handleBookNow}
              disabled={
                event.available_seats === 0 || event.status !== "upcoming"
              }
            >
              Book Ticket
            </Button>
          </div>
        </div>
      </Card>

      {/* Booking Form Modal */}
      {showBookingForm && (
        <BookingForm
          event={event}
          onSuccess={handleBookingSuccess}
          onCancel={handleBookingCancel}
        />
      )}
    </>
  );
};

export default EventCard;
