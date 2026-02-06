"use client";

import React, { useState } from 'react';
import { Lock, Eye, EyeOff } from 'lucide-react';

const PasswordInput = ({ 
  value, 
  onChange, 
  placeholder = "Enter password",
  required = false,
  disabled = false,
  className = "",
  error = false,
  label = "Password",
  showLabel = true,
  size = "default", // "default", "large"
  variant = "default", // "default", "login"
  autoComplete = "current-password",
  ...props 
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Size and variant classes
  const sizeClasses = {
    default: {
      input: "py-2.5 text-sm",
      icon: "w-4 h-4",
      eyeIcon: "w-4 h-4"
    },
    large: {
      input: "py-4 text-lg",
      icon: "w-5 h-5", 
      eyeIcon: "w-5 h-5"
    }
  };

  const variantClasses = {
    default: {
      label: "text-sm font-medium text-gray-700 dark:text-gray-300",
      input: "focus:ring-1 focus:ring-blue-500",
      container: "space-y-1.5"
    },
    login: {
      label: "text-lg font-bold text-gray-800 dark:text-gray-200",
      input: "focus:ring-2 focus:ring-red-500/30 focus:border-red-500 shadow-sm",
      container: "space-y-2"
    }
  };

  const currentSize = sizeClasses[size] || sizeClasses.default;
  const currentVariant = variantClasses[variant] || variantClasses.default;

  return (
    <div className={`${currentVariant.container} ${className}`}>
      {showLabel && (
        <label className={currentVariant.label}>
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div className="relative group">
        <Lock className={`absolute left-3 top-1/2 -translate-y-1/2 ${currentSize.icon} text-gray-400 ${variant === 'login' ? 'group-focus-within:text-red-500' : ''} transition-colors z-10`} />
        <input 
          type={showPassword ? "text" : "password"}
          placeholder={placeholder}
          className={`w-full pl-11 pr-12 ${currentSize.input} bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl focus:outline-none ${currentVariant.input} transition-all placeholder:text-gray-400 dark:text-white ${
            error ? 'border-red-500 focus:ring-red-500' : ''
          }`}
          value={value}
          onChange={onChange}
          required={required}
          disabled={disabled}
          autoComplete={autoComplete}
          {...props}
        />
        <button
          type="button"
          onClick={togglePasswordVisibility}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors z-10"
          tabIndex={-1}
        >
          {showPassword ? (
            <EyeOff className={currentSize.eyeIcon} />
          ) : (
            <Eye className={currentSize.eyeIcon} />
          )}
        </button>
      </div>
    </div>
  );
};

export default PasswordInput;