import { type ReactNode } from "react";
import {
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
} from "@heroicons/react/24/outline";
import { clsx } from "clsx";
import { formatNumber } from "@/utils/format";
import { Card } from "@/components/ui";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  change?: number; // +/- percentage vs prior period
  format?: "number" | "currency" | "plain";
  color?: "indigo" | "green" | "yellow" | "red";
}

const colorClasses = {
  indigo: "bg-indigo-50 text-indigo-600",
  green: "bg-green-50 text-green-600",
  yellow: "bg-yellow-50 text-yellow-600",
  red: "bg-red-50 text-red-600",
};

export default function StatsCard({
  title,
  value,
  icon,
  change,
  color = "indigo",
}: StatsCardProps) {
  const isPositive = change !== undefined && change >= 0;

  return (
    <Card>
      <div className="flex items-center justify-between">
        <div className={clsx("rounded-xl p-3", colorClasses[color])}>
          {icon}
        </div>
        {change !== undefined && (
          <div
            className={clsx(
              "flex items-center gap-1 text-sm font-medium",
              isPositive ? "text-green-600" : "text-red-500",
            )}
          >
            {isPositive ? (
              <ArrowTrendingUpIcon className="h-4 w-4" />
            ) : (
              <ArrowTrendingDownIcon className="h-4 w-4" />
            )}
            {Math.abs(change).toFixed(1)}%
          </div>
        )}
      </div>
      <div className="mt-4">
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <p className="mt-1 text-3xl font-bold text-gray-900">
          {typeof value === "number" ? formatNumber(value) : value}
        </p>
      </div>
    </Card>
  );
}
