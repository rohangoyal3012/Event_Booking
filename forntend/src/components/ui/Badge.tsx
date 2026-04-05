import { type HTMLAttributes } from "react";
import { clsx } from "clsx";

type BadgeColor =
  | "gray"
  | "green"
  | "yellow"
  | "red"
  | "blue"
  | "indigo"
  | "purple";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  color?: BadgeColor;
  size?: "sm" | "md";
}

const colorClasses: Record<BadgeColor, string> = {
  gray: "bg-gray-100 text-gray-700",
  green: "bg-green-100 text-green-700",
  yellow: "bg-yellow-100 text-yellow-700",
  red: "bg-red-100 text-red-700",
  blue: "bg-blue-100 text-blue-700",
  indigo: "bg-indigo-100 text-indigo-700",
  purple: "bg-purple-100 text-purple-700",
};

export function Badge({
  color = "gray",
  size = "sm",
  className,
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full font-medium",
        size === "sm" ? "px-2.5 py-0.5 text-xs" : "px-3 py-1 text-sm",
        colorClasses[color],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}

export default Badge;
