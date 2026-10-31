import React from 'react';

const Select = ({
  id,
  name,
  label,
  options = [],
  value,
  onChange,
  error,
  helperText,
  disabled = false,
  required = false,
  className = '',
  selectClassName = '',
  placeholder = 'Select an option',
  ...props
}) => {
  const selectId = id || name || `select-${Math.random().toString(36).substring(2, 9)}`;

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label
          htmlFor={selectId}
          className="block text-xs font-semibold text-solar-text mb-1.5 uppercase tracking-wider"
        >
          {label} {required && <span className="text-solar-danger">*</span>}
        </label>
      )}
      <div className="relative rounded-lg shadow-sm">
        <select
          id={selectId}
          name={name}
          disabled={disabled}
          required={required}
          value={value}
          onChange={onChange}
          className={`block w-full rounded-lg border text-sm appearance-none bg-white py-2.5 pl-3.5 pr-8 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-solar-secondary disabled:bg-slate-50 disabled:text-slate-400 ${
            error
              ? 'border-solar-danger text-solar-danger focus:ring-solar-danger'
              : 'border-solar-border text-solar-text focus:border-solar-secondary'
          } ${selectClassName}`}
          {...props}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((opt) => {
            const val = typeof opt === 'object' ? opt.value : opt;
            const labelText = typeof opt === 'object' ? opt.label : opt;
            return (
              <option key={val} value={val}>
                {labelText}
              </option>
            );
          })}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-slate-500">
          <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
            <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
          </svg>
        </div>
      </div>
      {error && <p className="mt-1 text-xs text-solar-danger font-medium">{error}</p>}
      {helperText && !error && (
        <p className="mt-1 text-xs text-solar-text-muted">{helperText}</p>
      )}
    </div>
  );
};

export default Select;
