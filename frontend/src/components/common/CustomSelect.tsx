import React, { useState, useRef, useEffect } from 'react';
import '../../styles/components/CustomSelect.css';

interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  label?: string;
}

const CustomSelect: React.FC<CustomSelectProps> = ({ value, onChange, options, label }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedLabel = options.find(opt => opt.value === value)?.label || options[0]?.label;

  return (
    <div className="custom-select-wrapper" ref={dropdownRef}>
      <button
        type="button"
        className="custom-select-button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={label}
      >
        <span className="custom-select-value">{selectedLabel}</span>
        <svg
          className={`custom-select-arrow ${isOpen ? 'open' : ''}`}
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="6 9 10 13 14 9"></polyline>
        </svg>
      </button>

      {isOpen && (
        <div className="custom-select-dropdown">
          {options.map(option => (
            <button
              key={option.value}
              type="button"
              className={`custom-select-option ${value === option.value ? 'selected' : ''}`}
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
            >
              <span className="option-label">{option.label}</span>
              {value === option.value && <span className="option-checkmark">✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default CustomSelect;
