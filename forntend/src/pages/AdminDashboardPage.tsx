import { useQuery } from "@tanstack/react-query";
import {
  CalendarDaysIcon,
  CurrencyRupeeIcon,
  TicketIcon,
  UsersIcon,
} from "@heroicons/react/24/outline";
import { FullPageSpinner, Card } from "@/components/ui";
import StatsCard from "@/features/admin/StatsCard";
import RevenueChart from "@/features/admin/RevenueChart";
import { analyticsService } from "@/services/analytics.service";
import { queryKeys } from "@/lib/queryClient";
import { formatPrice } from "@/utils/format";
import { useAuthStore } from "@/store/authStore";

export default function AdminDashboardPage() {
  const { isAdmin, isOrganizer } = useAuthStore();
  const isAdminUser = isAdmin();

  const statsQuery = useQuery({
    queryKey: queryKeys.analytics.dashboard,
    queryFn: isAdminUser
      ? analyticsService.getDashboardStats
      : analyticsService.getMyStats,
  });

  const revenueQuery = useQuery({
    queryKey: queryKeys.analytics.revenue(30),
    queryFn: () => analyticsService.getRevenueChart(30),
  });

  const topEventsQuery = useQuery({
    queryKey: queryKeys.analytics.topEvents,
    queryFn: () => analyticsService.getTopEvents(5),
  });

  if (statsQuery.isLoading) return <FullPageSpinner />;

  const stats = statsQuery.data;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          {isAdminUser ? "Admin Dashboard" : "Organizer Dashboard"}
        </h1>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {isAdminUser && (
          <>
            <StatsCard
              title="Total Events"
              value={(stats as { totalEvents?: number })?.totalEvents ?? 0}
              icon={<CalendarDaysIcon className="h-6 w-6" />}
              color="indigo"
            />
            <StatsCard
              title="Total Bookings"
              value={(stats as { totalBookings?: number })?.totalBookings ?? 0}
              icon={<TicketIcon className="h-6 w-6" />}
              color="green"
            />
            <StatsCard
              title="Total Revenue"
              value={formatPrice(
                (stats as { totalRevenue?: number })?.totalRevenue ?? 0,
              )}
              icon={<CurrencyRupeeIcon className="h-6 w-6" />}
              color="yellow"
            />
            <StatsCard
              title="Total Users"
              value={(stats as { totalUsers?: number })?.totalUsers ?? 0}
              icon={<UsersIcon className="h-6 w-6" />}
              color="red"
            />
          </>
        )}
        {isOrganizer() && !isAdminUser && (
          <>
            <StatsCard
              title="My Events"
              value={(stats as { totalEvents?: number })?.totalEvents ?? 0}
              icon={<CalendarDaysIcon className="h-6 w-6" />}
              color="indigo"
            />
            <StatsCard
              title="Bookings"
              value={(stats as { totalBookings?: number })?.totalBookings ?? 0}
              icon={<TicketIcon className="h-6 w-6" />}
              color="green"
            />
            <StatsCard
              title="Revenue"
              value={formatPrice(
                (stats as { totalRevenue?: number })?.totalRevenue ?? 0,
              )}
              icon={<CurrencyRupeeIcon className="h-6 w-6" />}
              color="yellow"
            />
            <StatsCard
              title="Avg Rating"
              value={`${((stats as { avgRating?: number })?.avgRating ?? 0).toFixed(1)} ★`}
              icon={<UsersIcon className="h-6 w-6" />}
              color="red"
            />
          </>
        )}
      </div>

      {/* Charts */}
      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RevenueChart
            data={revenueQuery.data ?? []}
            loading={revenueQuery.isLoading}
          />
        </div>

        {/* Top events */}
        <Card padding="lg">
          <h3 className="mb-4 text-base font-semibold text-gray-900">
            Top Events
          </h3>
          <div className="space-y-3">
            {topEventsQuery.isLoading ? (
              <p className="text-sm text-gray-400">Loading…</p>
            ) : (
              topEventsQuery.data?.map((ev, i) => (
                <div key={ev.id} className="flex items-center gap-3 text-sm">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-xs font-bold text-indigo-600">
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="truncate font-medium text-gray-900">
                      {ev.title}
                    </p>
                    <p className="text-gray-500">{ev.totalBookings} bookings</p>
                  </div>
                  <span className="font-semibold text-gray-900 shrink-0">
                    {formatPrice(ev.totalRevenue)}
                  </span>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
