import { clsx } from "clsx";
import { getInitials } from "@/utils/format";

interface AvatarProps {
  name: string;
  src?: string | null;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizeClasses = {
  xs: "h-6 w-6 text-xs",
  sm: "h-8 w-8 text-sm",
  md: "h-10 w-10 text-base",
  lg: "h-14 w-14 text-lg",
  xl: "h-20 w-20 text-2xl",
};

export default function Avatar({
  name,
  src,
  size = "md",
  className,
}: AvatarProps) {
  const classes = clsx(
    "inline-flex items-center justify-center rounded-full bg-indigo-100 font-semibold text-indigo-700 object-cover select-none",
    sizeClasses[size],
    className,
  );

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={clsx(classes, "bg-transparent")}
        loading="lazy"
        referrerPolicy="no-referrer"
      />
    );
  }

  return <span className={classes}>{getInitials(name)}</span>;
}
