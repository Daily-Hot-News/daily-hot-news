import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export function Button({ children, className, ...props }: ButtonProps) {
  return (
    <button
      className={`"mt-2 bg-blue-600 text-white font-semibold rounded-md px-4 py-2 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-300 cursor-pointer relativez-10" ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
