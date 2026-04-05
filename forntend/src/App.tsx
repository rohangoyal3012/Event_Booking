import { Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";
import RootLayout from "@/layouts/RootLayout";
import AdminLayout from "@/layouts/AdminLayout";
import PrivateRoute from "@/components/PrivateRoute";
import { FullPageSpinner } from "@/components/ui";
import { ROUTES } from "@/utils/constants";

// Lazy-loaded pages
const HomePage = lazy(() => import("@/pages/HomePage"));
const EventsPage = lazy(() => import("@/pages/EventsPage"));
const EventDetailPage = lazy(() => import("@/pages/EventDetailPage"));
const LoginPage = lazy(() => import("@/pages/LoginPage"));
const RegisterPage = lazy(() => import("@/pages/RegisterPage"));
const MyBookingsPage = lazy(() => import("@/pages/MyBookingsPage"));
const BookingSuccessPage = lazy(() => import("@/pages/BookingSuccessPage"));
const AdminDashboardPage = lazy(() => import("@/pages/AdminDashboardPage"));
const AdminEventsPage = lazy(() => import("@/pages/AdminEventsPage"));
const EventFormPage = lazy(() => import("@/pages/EventFormPage"));

const Fallback = () => <FullPageSpinner />;

export default function App() {
  return (
    <Suspense fallback={<Fallback />}>
      <Routes>
        {/* Public routes */}
        <Route element={<RootLayout />}>
          <Route index element={<HomePage />} />
          <Route path="events" element={<EventsPage />} />
          <Route path="events/:slug" element={<EventDetailPage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />

          {/* Auth-required routes */}
          <Route
            path="my-bookings"
            element={
              <PrivateRoute>
                <MyBookingsPage />
              </PrivateRoute>
            }
          />
          <Route
            path="booking-success"
            element={
              <PrivateRoute>
                <BookingSuccessPage />
              </PrivateRoute>
            }
          />
        </Route>

        {/* Admin / Organizer routes */}
        <Route
          path="admin"
          element={
            <PrivateRoute roles={["ADMIN", "ORGANIZER"]}>
              <AdminLayout />
            </PrivateRoute>
          }
        >
          <Route index element={<AdminDashboardPage />} />
          <Route path="events" element={<AdminEventsPage />} />
          <Route path="events/new" element={<EventFormPage mode="create" />} />
          <Route
            path="events/:id/edit"
            element={<EventFormPage mode="edit" />}
          />
        </Route>

        {/* 404 */}
        <Route
          path="*"
          element={
            <div className="flex min-h-screen flex-col items-center justify-center gap-4">
              <h1 className="text-4xl font-bold text-gray-900">404</h1>
              <p className="text-gray-500">Page not found</p>
              <a href={ROUTES.HOME} className="text-indigo-600 hover:underline">
                Go home
              </a>
            </div>
          }
        />
      </Routes>
    </Suspense>
  );
}
