import React from "react";

const Card = ({
  children,
  className = "",
  hover = false,
  gradient = false,
  padding = "md",
  ...props
}) => {
  const baseStyles =
    "bg-white rounded-xl shadow-md transition-all duration-300";
  const hoverStyles = hover ? "hover:shadow-xl hover:-translate-y-1" : "";
  const gradientStyles = gradient ? "bg-gradient-primary text-white" : "";

  const paddings = {
    none: "",
    sm: "p-4",
    md: "p-6",
    lg: "p-8",
  };

  return (
    <div
      className={`${baseStyles} ${hoverStyles} ${gradientStyles} ${paddings[padding]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
