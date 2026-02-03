"use client";

import React from 'react';
import PhoneInput from 'react-country-phone-input';
import 'react-country-phone-input/lib/style.css';

const CustomPhoneInput = ({ 
  value, 
  onChange, 
  placeholder = "Enter phone number",
  required = false,
  disabled = false,
  className = "",
  error = false,
  ...props 
}) => {
  const handleChange = (phone, country) => {
    if (onChange) {
      onChange(phone);
    }
  };

  return (
    <div className={`${className} ${error ? 'error' : ''}`}>
      <PhoneInput
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        disabled={disabled}
        defaultCountry="in"
        enableSearch={true}
        disableCountryCode={false}
        disableDropdown={false}
        inputProps={{
          name: 'phone',
          required: required,
          autoFocus: false
        }}
        {...props}
      />
      {required && !value && (
        <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-red-500 text-sm">*</span>
      )}
    </div>
  );
};

export default CustomPhoneInput;