import { type HTMLAttributes } from "react";
import { motion } from "framer-motion";
import { clsx } from "clsx";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
  padding?: "none" | "sm" | "md" | "lg";
}

const paddingClasses = {
  none: "",
  sm: "p-3",
  md: "p-5",
  lg: "p-7",
};

export function Card({
  hover = false,
  padding = "md",
  className,
  children,
  ...props
}: CardProps) {
  const base = clsx(
    "rounded-xl border border-gray-200 bg-white shadow-sm",
    paddingClasses[padding],
    className,
  );

  if (hover) {
    return (
      <motion.div
        whileHover={{ y: -2, boxShadow: "0 8px 24px rgba(0,0,0,0.10)" }}
        transition={{ duration: 0.2 }}
        className={base}
        {...(props as HTMLAttributes<HTMLDivElement>)}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <div className={base} {...props}>
      {children}
    </div>
  );
}

export function CardHeader({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={clsx("mb-4 border-b border-gray-100 pb-4", className)}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardBody({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={clsx("", className)} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={clsx("mt-4 border-t border-gray-100 pt-4", className)}
      {...props}
    >
      {children}
    </div>
  );
}

export default Card;
