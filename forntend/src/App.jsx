import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Navbar from "./layouts/Navbar";
import PrivateRoute from "./components/PrivateRoute";
import Home from "./pages/Home";
import CreateEvent from "./pages/CreateEvent";
import EventDetails from "./pages/EventDetails";
import EditEvent from "./pages/EditEvent";
import Login from "./pages/Login";
import Register from "./pages/Register";
import BookingSuccess from "./pages/BookingSuccess";
import AdminDashboard from "./pages/AdminDashboard";
import MyBookings from "./pages/MyBookings";

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen flex flex-col bg-gray-50">
          <Navbar />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/events" element={<Home />} />
              <Route path="/events/:id" element={<EventDetails />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/booking-success" element={<BookingSuccess />} />
              <Route
                path="/my-bookings"
                element={
                  <PrivateRoute>
                    <MyBookings />
                  </PrivateRoute>
                }
              />
              <Route
                path="/admin/dashboard"
                element={
                  <PrivateRoute adminOnly={true}>
                    <AdminDashboard />
                  </PrivateRoute>
                }
              />
              <Route
                path="/create"
                element={
                  <PrivateRoute adminOnly={true}>
                    <CreateEvent />
                  </PrivateRoute>
                }
              />
              <Route
                path="/events/:id/edit"
                element={
                  <PrivateRoute adminOnly={true}>
                    <EditEvent />
                  </PrivateRoute>
                }
              />
            </Routes>
          </main>
          <footer className="bg-dark-900 text-white py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center text-white text-xl font-bold">
                    E
                  </div>
                  <span className="text-2xl font-display font-bold">
                    EventBooking
                  </span>
                </div>
                <p className="text-dark-400 mb-2">
                  Your gateway to unforgettable events
                </p>
                <p className="text-dark-500 text-sm">
                  &copy; 2025 EventBooking. All rights reserved.
                </p>
              </div>
            </div>
          </footer>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
