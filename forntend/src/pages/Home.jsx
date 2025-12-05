import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { eventService } from "../services/api";
import EventList from "../features/events/EventList";
import Button from "../shared/components/Button";
import Card from "../shared/components/Card";

const Home = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [stats, setStats] = useState({
    totalEvents: 0,
    totalAttendees: 0,
    upcomingEvents: 0,
  });

  const navigate = useNavigate();

  useEffect(() => {
    fetchEvents();

    // Set up polling interval for real-time updates every 5 seconds
    const intervalId = setInterval(() => {
      fetchEvents(true); // Pass true to indicate background refresh
    }, 5000);

    // Cleanup interval on unmount
    return () => clearInterval(intervalId);
  }, []);

  const fetchEvents = async (isBackgroundRefresh = false) => {
    try {
      if (!isBackgroundRefresh) {
        setLoading(true);
      } else {
        setIsRefreshing(true);
      }
      setError(null);
      const response = await eventService.getAllEvents();
      const eventsData = response.events || [];
      setEvents(eventsData);

      // Calculate stats
      setStats({
        totalEvents: eventsData.length,
        totalAttendees: eventsData.reduce(
          (sum, e) => sum + (e.capacity - e.available_seats),
          0
        ),
        upcomingEvents: eventsData.filter((e) => e.status === "upcoming")
          .length,
      });
    } catch (err) {
      if (!isBackgroundRefresh) {
        setError("Failed to load events. Please try again later.");
      }
    } finally {
      if (!isBackgroundRefresh) {
        setLoading(false);
      } else {
        setIsRefreshing(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-primary-50/30 to-white">
      {/* Real-time Update Indicator */}
      {isRefreshing && (
        <div className="fixed top-20 right-4 z-50 flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-lg border border-primary-200 animate-slide-in">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
          <span className="text-sm font-medium text-dark-700">
            Live Updates
          </span>
        </div>
      )}

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-primary opacity-5"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="text-center animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-100 rounded-full text-primary-700 font-medium mb-6">
              <span className="w-2 h-2 bg-primary-500 rounded-full animate-pulse"></span>
              Now Booking for 2025
            </div>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-display font-bold text-dark-900 mb-6">
              Discover. Book.{" "}
              <span className="bg-gradient-primary bg-clip-text text-transparent">
                Experience.
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-dark-600 mb-8 max-w-3xl mx-auto">
              Your gateway to unforgettable events. From conferences to
              concerts, find and book the experiences that matter to you.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                variant="primary"
                size="lg"
                onClick={() => {
                  const eventsSection =
                    document.getElementById("events-section");
                  eventsSection?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                Browse Events
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
                    d="M17 8l4 4m0 0l-4 4m4-4H3"
                  />
                </svg>
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => navigate("/register")}
              >
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center" hover>
              <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🎉</span>
              </div>
              <h3 className="text-4xl font-bold text-dark-900 mb-2">
                {loading ? "..." : stats.totalEvents}+
              </h3>
              <p className="text-dark-600 font-medium">Total Events</p>
            </Card>

            <Card className="text-center" hover>
              <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">👥</span>
              </div>
              <h3 className="text-4xl font-bold text-dark-900 mb-2">
                {loading ? "..." : stats.totalAttendees}+
              </h3>
              <p className="text-dark-600 font-medium">Happy Attendees</p>
            </Card>

            <Card className="text-center" hover>
              <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">📅</span>
              </div>
              <h3 className="text-4xl font-bold text-dark-900 mb-2">
                {loading ? "..." : stats.upcomingEvents}+
              </h3>
              <p className="text-dark-600 font-medium">Upcoming Events</p>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-display font-bold text-dark-900 mb-4">
              Why Choose Us
            </h2>
            <p className="text-xl text-dark-600 max-w-2xl mx-auto">
              Experience seamless event booking with our platform
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: "⚡",
                title: "Easy Booking",
                description:
                  "Book your tickets in just a few clicks with our streamlined process",
              },
              {
                icon: "🔒",
                title: "Secure Payment",
                description:
                  "Your transactions are protected with industry-standard security",
              },
              {
                icon: "🎫",
                title: "Instant Tickets",
                description:
                  "Get your tickets immediately after successful booking",
              },
              {
                icon: "💬",
                title: "24/7 Support",
                description: "Our support team is always here to help you",
              },
            ].map((feature, index) => (
              <Card key={index} className="text-center" hover>
                <div className="text-5xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold text-dark-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-dark-600">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Events Section */}
      <section id="events-section" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-display font-bold text-dark-900 mb-4">
              Upcoming Events
            </h2>
            <p className="text-xl text-dark-600 max-w-2xl mx-auto">
              Discover amazing events happening near you
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : error ? (
            <Card className="text-center py-12">
              <div className="text-5xl mb-4">⚠️</div>
              <p className="text-red-600 text-lg">{error}</p>
              <Button variant="primary" className="mt-6" onClick={fetchEvents}>
                Try Again
              </Button>
            </Card>
          ) : events.length === 0 ? (
            <Card className="text-center py-12">
              <div className="text-5xl mb-4">🎭</div>
              <h3 className="text-2xl font-bold text-dark-900 mb-2">
                No Events Available
              </h3>
              <p className="text-dark-600">
                Check back soon for exciting new events!
              </p>
            </Card>
          ) : (
            <EventList events={events} />
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-primary">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-display font-bold text-white mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Join thousands of event-goers and start booking your next amazing
            experience today
          </p>
          <Button
            variant="dark"
            size="lg"
            onClick={() => navigate("/register")}
          >
            Create Your Account
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Home;
