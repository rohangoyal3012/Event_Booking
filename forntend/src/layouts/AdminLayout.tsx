import { Outlet, NavLink } from "react-router-dom";
import {
  ChartBarIcon,
  CalendarDaysIcon,
  TicketIcon,
  UsersIcon,
} from "@heroicons/react/24/outline";
import { ROUTES } from "@/utils/constants";
import { clsx } from "clsx";

const adminNav = [
  {
    to: ROUTES.ADMIN.DASHBOARD,
    label: "Dashboard",
    icon: ChartBarIcon,
    end: true,
  },
  { to: ROUTES.ADMIN.EVENTS, label: "Events", icon: CalendarDaysIcon },
  { to: ROUTES.ADMIN.BOOKINGS, label: "Bookings", icon: TicketIcon },
  { to: ROUTES.ADMIN.USERS, label: "Users", icon: UsersIcon },
];

export default function AdminLayout() {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="hidden w-60 shrink-0 border-r border-gray-200 bg-white lg:flex lg:flex-col">
        <div className="flex h-16 items-center border-b border-gray-100 px-6">
          <span className="text-sm font-bold text-gray-700 uppercase tracking-wider">
            Admin
          </span>
        </div>
        <nav className="flex flex-col gap-1 p-3">
          {adminNav.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                clsx(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-indigo-50 text-indigo-700"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                )
              }
            >
              <Icon className="h-5 w-5" />
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto bg-gray-50">
        <Outlet />
      </main>
    </div>
  );
}
