import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card } from "@/components/ui";
import { formatDate, formatPrice } from "@/utils/format";
import type { RevenueDataPoint } from "@/services/analytics.service";

interface RevenueChartProps {
  data: RevenueDataPoint[];
  loading?: boolean;
}

const CustomTooltip = ({ active, payload, label }: Record<string, unknown>) => {
  if (active && Array.isArray(payload) && payload.length) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-lg text-sm">
        <p className="mb-1 font-medium text-gray-700">{String(label)}</p>
        <p className="text-indigo-600">
          Revenue: {formatPrice((payload[0] as { value: number }).value)}
        </p>
        <p className="text-gray-500">
          Bookings: {(payload[1] as { value: number }).value}
        </p>
      </div>
    );
  }
  return null;
};

export default function RevenueChart({ data, loading }: RevenueChartProps) {
  const formatted = data.map((d) => ({
    ...d,
    date: formatDate(d.date, "dd MMM"),
  }));

  return (
    <Card padding="lg">
      <h3 className="mb-6 text-base font-semibold text-gray-900">
        Revenue (Last 30 Days)
      </h3>
      {loading ? (
        <div className="flex h-64 items-center justify-center text-gray-400">
          Loading chart…
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart
            data={formatted}
            margin={{ top: 5, right: 10, left: 10, bottom: 0 }}
          >
            <defs>
              <linearGradient id="revGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11, fill: "#9ca3af" }}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "#9ca3af" }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#4f46e5"
              strokeWidth={2}
              fill="url(#revGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </Card>
  );
}
