import React from "react";

const Input = ({
  label,
  error,
  icon,
  className = "",
  containerClassName = "",
  ...props
}) => {
  return (
    <div className={`mb-4 ${containerClassName}`}>
      {label && (
        <label className="block text-sm font-medium text-dark-700 mb-2">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400">
            {icon}
          </div>
        )}
        <input
          className={`
            w-full px-4 py-3 rounded-lg border-2 border-dark-200
            focus:border-primary-500 focus:ring-4 focus:ring-primary-100
            transition-all duration-200 outline-none
            ${icon ? "pl-10" : ""}
            ${
              error
                ? "border-red-500 focus:border-red-500 focus:ring-red-100"
                : ""
            }
            ${className}
          `}
          {...props}
        />
      </div>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
};

export default Input;
