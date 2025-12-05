import React from "react";
import EventCard from "./EventCard";

const EventList = ({ events, loading }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="h-48 bg-dark-200 rounded-lg mb-4"></div>
              <div className="h-6 bg-dark-200 rounded mb-3"></div>
              <div className="h-4 bg-dark-200 rounded mb-2"></div>
              <div className="h-4 bg-dark-200 rounded w-3/4"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!events || events.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {events.map((event) => (
        <EventCard key={event.id} event={event} />
      ))}
    </div>
  );
};

export default EventList;
