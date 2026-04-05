import { Link, NavLink, useNavigate } from "react-router-dom";
import { useState } from "react";
import {
  Bars3Icon,
  XMarkIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline";
import { CalendarDaysIcon } from "@heroicons/react/24/solid";
import { Button, Avatar } from "@/components/ui";
import { useAuthStore } from "@/store/authStore";
import { authService } from "@/services/auth.service";
import { ROUTES } from "@/utils/constants";
import toast from "react-hot-toast";
import { clsx } from "clsx";

export default function Navbar() {
  const navigate = useNavigate();
  const { user, isAuthenticated, isAdmin, isOrganizer, clearAuth } =
    useAuthStore();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await authService.logout();
    } finally {
      clearAuth();
      navigate(ROUTES.HOME);
      toast.success("Signed out");
    }
  };

  const navLinks = [
    { to: ROUTES.EVENTS, label: "Events" },
    ...(isAuthenticated()
      ? [{ to: ROUTES.MY_BOOKINGS, label: "My Bookings" }]
      : []),
    ...(isAdmin() || isOrganizer()
      ? [{ to: ROUTES.ADMIN.DASHBOARD, label: "Dashboard" }]
      : []),
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-gray-100 bg-white/95 backdrop-blur-sm">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link
          to={ROUTES.HOME}
          className="flex items-center gap-2 text-indigo-600"
        >
          <CalendarDaysIcon className="h-7 w-7" />
          <span className="text-lg font-bold text-gray-900">EventBook</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-6 md:flex">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                clsx(
                  "text-sm font-medium transition-colors",
                  isActive
                    ? "text-indigo-600"
                    : "text-gray-600 hover:text-gray-900",
                )
              }
            >
              {link.label}
            </NavLink>
          ))}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {isAuthenticated() && user ? (
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen((v) => !v)}
                className="flex items-center gap-2 rounded-full p-1 hover:bg-gray-100"
              >
                <Avatar name={user.name} src={user.avatarUrl} size="sm" />
                <span className="hidden text-sm font-medium text-gray-700 md:block">
                  {user.name.split(" ")[0]}
                </span>
              </button>
              {userMenuOpen && (
                <>
                  <div
                    className="fixed inset-0"
                    onClick={() => setUserMenuOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-48 rounded-xl border border-gray-200 bg-white shadow-lg">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">
                        {user.name}
                      </p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                    <div className="py-1">
                      <Link
                        to={ROUTES.MY_BOOKINGS}
                        onClick={() => setUserMenuOpen(false)}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        My Bookings
                      </Link>
                      {(isAdmin() || isOrganizer()) && (
                        <Link
                          to={ROUTES.ADMIN.DASHBOARD}
                          onClick={() => setUserMenuOpen(false)}
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          Dashboard
                        </Link>
                      )}
                      <button
                        onClick={() => {
                          setUserMenuOpen(false);
                          handleLogout();
                        }}
                        className="block w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                      >
                        Sign out
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            <>
              <Button variant="ghost" size="sm">
                <Link to={ROUTES.LOGIN}>Sign in</Link>
              </Button>
              <Button size="sm">
                <Link to={ROUTES.REGISTER}>Get started</Link>
              </Button>
            </>
          )}

          {/* Mobile menu button */}
          <button
            className="md:hidden rounded-lg p-2 hover:bg-gray-100"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? (
              <XMarkIcon className="h-5 w-5" />
            ) : (
              <Bars3Icon className="h-5 w-5" />
            )}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t border-gray-100 bg-white px-4 pb-4 md:hidden">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                clsx(
                  "block py-2 text-sm font-medium",
                  isActive ? "text-indigo-600" : "text-gray-700",
                )
              }
            >
              {link.label}
            </NavLink>
          ))}
          {!isAuthenticated() && (
            <div className="mt-4 flex gap-2">
              <Button variant="ghost" size="sm" fullWidth>
                <Link to={ROUTES.LOGIN} className="w-full">
                  Sign in
                </Link>
              </Button>
              <Button size="sm" fullWidth>
                <Link to={ROUTES.REGISTER} className="w-full">
                  Register
                </Link>
              </Button>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
