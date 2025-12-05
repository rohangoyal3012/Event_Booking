import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Button from "../shared/components/Button";

const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
    setMobileMenuOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-white/80 backdrop-blur-lg border-b border-dark-100 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center text-white text-xl font-bold group-hover:scale-110 transition-transform duration-300">
              E
            </div>
            <span className="text-2xl font-display font-bold bg-gradient-primary bg-clip-text text-transparent hidden sm:block">
              EventBooking
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-8">
            <Link
              to="/"
              className={`text-base font-medium transition-all duration-300 relative ${
                isActive("/") || isActive("/events")
                  ? "text-primary-600"
                  : "text-dark-600 hover:text-primary-600"
              }`}
            >
              Events
              {(isActive("/") || isActive("/events")) && (
                <span className="absolute -bottom-2 left-0 w-full h-0.5 bg-gradient-primary"></span>
              )}
            </Link>

            {isAdmin() && (
              <>
                <Link
                  to="/create"
                  className={`text-base font-medium transition-all duration-300 relative ${
                    isActive("/create")
                      ? "text-primary-600"
                      : "text-dark-600 hover:text-primary-600"
                  }`}
                >
                  Create Event
                  {isActive("/create") && (
                    <span className="absolute -bottom-2 left-0 w-full h-0.5 bg-gradient-primary"></span>
                  )}
                </Link>
                <Link
                  to="/admin/dashboard"
                  className={`text-base font-medium transition-all duration-300 relative ${
                    isActive("/admin/dashboard")
                      ? "text-primary-600"
                      : "text-dark-600 hover:text-primary-600"
                  }`}
                >
                  Dashboard
                  {isActive("/admin/dashboard") && (
                    <span className="absolute -bottom-2 left-0 w-full h-0.5 bg-gradient-primary"></span>
                  )}
                </Link>
              </>
            )}

            {isAuthenticated() && !isAdmin() && (
              <Link
                to="/my-bookings"
                className={`text-base font-medium transition-all duration-300 relative ${
                  isActive("/my-bookings")
                    ? "text-primary-600"
                    : "text-dark-600 hover:text-primary-600"
                }`}
              >
                My Bookings
                {isActive("/my-bookings") && (
                  <span className="absolute -bottom-2 left-0 w-full h-0.5 bg-gradient-primary"></span>
                )}
              </Link>
            )}
          </div>

          {/* Desktop Auth Buttons */}
          <div className="hidden lg:flex items-center gap-3">
            {!isAuthenticated() ? (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate("/login")}
                >
                  Login
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => navigate("/register")}
                >
                  Sign Up
                </Button>
              </>
            ) : (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 bg-gradient-primary rounded-full flex items-center justify-center text-white font-semibold">
                    {user?.username?.charAt(0).toUpperCase() || "U"}
                  </div>
                  <span className="text-sm font-medium text-dark-700">
                    {user?.username}
                  </span>
                </div>
                <Button variant="outline" size="sm" onClick={handleLogout}>
                  Logout
                </Button>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg hover:bg-dark-50 transition-colors duration-300"
          >
            <svg
              className="w-6 h-6 text-dark-700"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {mobileMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-dark-100 bg-white animate-slide-down">
          <div className="px-4 py-4 space-y-3">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className={`block px-4 py-3 rounded-lg font-medium transition-colors ${
                isActive("/") || isActive("/events")
                  ? "bg-primary-50 text-primary-600"
                  : "text-dark-700 hover:bg-dark-50"
              }`}
            >
              Events
            </Link>

            {isAdmin() && (
              <>
                <Link
                  to="/create"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-4 py-3 rounded-lg font-medium transition-colors ${
                    isActive("/create")
                      ? "bg-primary-50 text-primary-600"
                      : "text-dark-700 hover:bg-dark-50"
                  }`}
                >
                  Create Event
                </Link>
                <Link
                  to="/admin/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-4 py-3 rounded-lg font-medium transition-colors ${
                    isActive("/admin/dashboard")
                      ? "bg-primary-50 text-primary-600"
                      : "text-dark-700 hover:bg-dark-50"
                  }`}
                >
                  Dashboard
                </Link>
              </>
            )}

            {isAuthenticated() && !isAdmin() && (
              <Link
                to="/my-bookings"
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-4 py-3 rounded-lg font-medium transition-colors ${
                  isActive("/my-bookings")
                    ? "bg-primary-50 text-primary-600"
                    : "text-dark-700 hover:bg-dark-50"
                }`}
              >
                My Bookings
              </Link>
            )}

            <div className="pt-3 border-t border-dark-100">
              {!isAuthenticated() ? (
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    size="md"
                    className="w-full"
                    onClick={() => {
                      navigate("/login");
                      setMobileMenuOpen(false);
                    }}
                  >
                    Login
                  </Button>
                  <Button
                    variant="primary"
                    size="md"
                    className="w-full"
                    onClick={() => {
                      navigate("/register");
                      setMobileMenuOpen(false);
                    }}
                  >
                    Sign Up
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center gap-3 px-4 py-2">
                    <div className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center text-white font-semibold">
                      {user?.username?.charAt(0).toUpperCase() || "U"}
                    </div>
                    <span className="font-medium text-dark-700">
                      {user?.username}
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    size="md"
                    className="w-full"
                    onClick={handleLogout}
                  >
                    Logout
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
