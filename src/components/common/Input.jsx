import React from 'react';

const Input = ({
  id,
  name,
  label,
  type = 'text',
  placeholder = '',
  value,
  onChange,
  error,
  helperText,
  icon: Icon,
  disabled = false,
  required = false,
  className = '',
  inputClassName = '',
  ...props
}) => {
  const inputId = id || name || `input-${Math.random().toString(36).substring(2, 9)}`;

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label
          htmlFor={inputId}
          className="block text-xs font-semibold text-solar-text mb-1.5 uppercase tracking-wider"
        >
          {label} {required && <span className="text-solar-danger">*</span>}
        </label>
      )}
      <div className="relative rounded-lg shadow-sm">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Icon className="h-4 w-4" />
          </div>
        )}
        <input
          id={inputId}
          name={name}
          type={type}
          disabled={disabled}
          required={required}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`block w-full rounded-lg border text-sm transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-solar-secondary disabled:bg-slate-50 disabled:text-slate-400 ${
            Icon ? 'pl-9' : 'pl-3.5'
          } pr-3.5 py-2.5 ${
            error
              ? 'border-solar-danger text-solar-danger focus:ring-solar-danger'
              : 'border-solar-border text-solar-text focus:border-solar-secondary bg-white'
          } ${inputClassName}`}
          {...props}
        />
      </div>
      {error && <p className="mt-1 text-xs text-solar-danger font-medium">{error}</p>}
      {helperText && !error && (
        <p className="mt-1 text-xs text-solar-text-muted">{helperText}</p>
      )}
    </div>
  );
};

export default Input;
