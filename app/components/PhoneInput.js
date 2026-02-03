"use client";

import React from 'react';
import PhoneInputComponent from 'react-phone-number-input';
import 'react-phone-number-input/style.css';

const PhoneInput = ({ 
  value, 
  onChange, 
  placeholder = "Enter phone number",
  required = false,
  disabled = false,
  className = "",
  error = false,
  ...props 
}) => {
  return (
    <div className="relative">
      <PhoneInputComponent
        international
        defaultCountry="IN"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        className={`phone-input-container ${className} ${error ? 'error' : ''}`}
        {...props}
      />
      {required && !value && (
        <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-red-500 text-sm">*</span>
      )}
    </div>
  );
};

export default PhoneInput;