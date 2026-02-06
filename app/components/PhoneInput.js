"use client";

import React, { useState, useEffect } from 'react';
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
  const [phoneValue, setPhoneValue] = useState(value || '+91');

  useEffect(() => {
    // If value changes from parent, update local state
    if (value !== phoneValue) {
      setPhoneValue(value || '+91');
    }
  }, [value]);

  const handleChange = (phone, country) => {
    setPhoneValue(phone);
    if (onChange) {
      onChange(phone);
    }
  };

  return (
    <div className={`${className} ${error ? 'error' : ''}`}>
      <PhoneInput
        value={phoneValue}
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
      {required && !phoneValue && (
        <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-red-500 text-sm">*</span>
      )}
    </div>
  );
};

export default CustomPhoneInput;