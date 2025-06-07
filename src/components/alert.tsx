"use client";

import React, { useEffect } from "react";

export type AlertProps = {
  message: string;
  type: "success" | "error";
  duration?: number; // Duration in milliseconds (default is 3000ms)
  onDismiss?: () => void;
};

const Alert: React.FC<AlertProps> = ({ message, type, duration = 3000, onDismiss }) => {
  // Auto-dismiss after the specified duration.
  useEffect(() => {
    const timer = setTimeout(() => {
      if (onDismiss) {
        onDismiss();
      }
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onDismiss]);

  // Choose Tailwind CSS classes based on alert type.
  const bgColor = type === "success" ? "bg-green-100" : "bg-red-100";
  const textColor = type === "success" ? "text-green-800" : "text-red-800";
  const borderColor = type === "success" ? "border-green-400" : "border-red-400";

  return (
    <div className={`${bgColor} ${textColor} border ${borderColor} px-4 py-3 rounded fixed top-4 right-4 shadow-md z-50`}>
      <span>{message}</span>
    </div>
  );
};

export default Alert;