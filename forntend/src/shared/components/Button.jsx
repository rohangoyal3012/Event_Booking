import React from "react";

const Button = ({
  children,
  variant = "primary",
  size = "md",
  className = "",
  icon,
  disabled = false,
  ...props
}) => {
  const baseStyles =
    "inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed";

  const variants = {
    primary:
      "bg-gradient-primary text-white hover:shadow-glow hover:scale-105 active:scale-95",
    secondary:
      "bg-white text-primary-600 border-2 border-primary-500 hover:bg-primary-50 hover:shadow-lg",
    outline:
      "bg-transparent text-dark-900 border-2 border-dark-300 hover:bg-dark-100 hover:border-dark-400",
    ghost: "bg-transparent text-dark-700 hover:bg-dark-100",
    dark: "bg-dark-900 text-white hover:bg-dark-800 hover:shadow-lg",
  };

  const sizes = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg",
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled}
      {...props}
    >
      {icon && <span className="text-xl">{icon}</span>}
      {children}
    </button>
  );
};

export default Button;
