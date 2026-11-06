import React, { useState, useRef, useEffect, useId } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export const CustomDropdown = ({
  options = [],
  children,
  value,
  onChange,
  name,
  label,
  placeholder = 'Select an option',
  disabled = false,
  searchable = false,
  error,
  className = '',
  buttonClassName = '',
  menuClassName = '',
  icon,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);
  const listRef = useRef(null);
  const id = useId();

  // Normalize options from options prop or React.Children (<option> tags)
  let normalizedOptions = [];
  if (options && options.length > 0) {
    normalizedOptions = options.map((opt) => {
      if (typeof opt === 'string' || typeof opt === 'number') {
        return { value: String(opt), label: String(opt) };
      }
      return {
        value: String(opt.value !== undefined ? opt.value : opt.id || ''),
        label: opt.label || opt.name || String(opt.value),
        icon: opt.icon,
      };
    });
  } else if (children) {
    React.Children.forEach(children, (child) => {
      if (child && child.type === 'option') {
        normalizedOptions.push({
          value: String(child.props.value !== undefined ? child.props.value : ''),
          label: child.props.children || String(child.props.value),
        });
      }
    });
  }

  // Filter options by search text
  const filteredOptions = normalizedOptions.filter((opt) =>
    String(opt.label).toLowerCase().includes(search.toLowerCase())
  );

  // Selected option
  const selectedOption = normalizedOptions.find((opt) => String(opt.value) === String(value));

  // Determine if search input should appear automatically (when >= 6 items or explicitly enabled)
  const shouldShowSearch = searchable || normalizedOptions.length >= 6;

  // Handle outside clicks
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
        setSearch('');
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Focus search input when opened
  useEffect(() => {
    if (isOpen && shouldShowSearch && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }
  }, [isOpen, shouldShowSearch]);

  const handleSelect = (optValue) => {
    if (onChange) {
      // Create synthetic event for drop-in compatibility with (e) => setVal(e.target.value)
      const syntheticEvent = {
        target: { name, value: optValue },
        currentTarget: { name, value: optValue },
        value: optValue,
      };
      onChange(syntheticEvent);
    }
    setIsOpen(false);
    setSearch('');
    setHighlightedIndex(-1);
  };

  const handleKeyDown = (e) => {
    if (disabled) return;

    if (!isOpen) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex((prev) => (prev < filteredOptions.length - 1 ? prev + 1 : 0));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : filteredOptions.length - 1));
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < filteredOptions.length) {
          handleSelect(filteredOptions[highlightedIndex].value);
        } else if (filteredOptions.length === 1) {
          handleSelect(filteredOptions[0].value);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        setSearch('');
        break;
      default:
        break;
    }
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {label && (
        <label
          htmlFor={id}
          className="block text-sm font-bold text-slate-800 dark:text-slate-200 mb-1.5"
        >
          {label}
        </label>
      )}

      {/* Dropdown Trigger Button */}
      <button
        id={id}
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={`w-full flex items-center justify-between gap-2 px-4 py-2.5 bg-white dark:bg-dark-card border rounded-2xl text-sm font-semibold transition-all tap-target text-left shadow-sm ${
          error
            ? 'border-rose-400 focus:ring-rose-500/30'
            : isOpen
            ? 'border-brand-500 ring-4 ring-brand-500/15 dark:border-brand-400'
            : 'border-slate-200 dark:border-dark-border hover:border-slate-300 dark:hover:border-slate-600'
        } ${disabled ? 'opacity-50 cursor-not-allowed bg-slate-100 dark:bg-dark-surface' : 'cursor-pointer'} ${buttonClassName}`}
      >
        <div className="flex items-center gap-2.5 truncate">
          {icon && <span className="text-slate-400 dark:text-dark-textMuted shrink-0">{icon}</span>}
          {selectedOption?.icon && <span className="shrink-0">{selectedOption.icon}</span>}
          <span
            className={`truncate ${
              selectedOption
                ? 'text-slate-900 dark:text-white'
                : 'text-slate-400 dark:text-slate-500 font-normal'
            }`}
          >
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </div>

        <motion.span
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="shrink-0 text-slate-400 dark:text-dark-textMuted"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
          </svg>
        </motion.span>
      </button>

      {/* Animated Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className={`absolute z-50 mt-2 w-full min-w-[220px] bg-white dark:bg-dark-surface border border-slate-200 dark:border-dark-border rounded-2xl shadow-xl shadow-brand-500/10 overflow-hidden ${menuClassName}`}
          >
            {/* Search Input when long list */}
            {shouldShowSearch && (
              <div className="p-2 border-b border-slate-100 dark:border-dark-border">
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 dark:text-dark-textMuted">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </span>
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setHighlightedIndex(0);
                    }}
                    onKeyDown={handleKeyDown}
                    placeholder="Search options..."
                    className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-xl text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                  />
                </div>
              </div>
            )}

            {/* Options List */}
            <ul
              ref={listRef}
              role="listbox"
              className="max-h-60 overflow-y-auto p-1.5 space-y-0.5 focus:outline-none"
            >
              {filteredOptions.length === 0 ? (
                <li className="px-3 py-4 text-xs text-center text-slate-400 dark:text-dark-textMuted">
                  No options found
                </li>
              ) : (
                filteredOptions.map((opt, idx) => {
                  const isSelected = String(opt.value) === String(value);
                  const isHighlighted = idx === highlightedIndex;

                  return (
                    <li
                      key={`${opt.value}-${idx}`}
                      role="option"
                      aria-selected={isSelected}
                      onClick={() => handleSelect(opt.value)}
                      onMouseEnter={() => setHighlightedIndex(idx)}
                      className={`flex items-center justify-between px-3 py-2 text-sm rounded-xl cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-brand-50 dark:bg-brand-500/20 text-brand-700 dark:text-brand-300 font-bold'
                          : isHighlighted
                          ? 'bg-slate-100 dark:bg-dark-card text-slate-900 dark:text-white'
                          : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-dark-card/60'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        {opt.icon && <span className="shrink-0">{opt.icon}</span>}
                        <span className="truncate">{opt.label}</span>
                      </div>

                      {isSelected && (
                        <span className="text-brand-500 dark:text-brand-400 shrink-0 ml-2">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </span>
                      )}
                    </li>
                  );
                })
              )}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>

      {error && <p className="mt-1 text-xs text-rose-500 font-medium">{error}</p>}
    </div>
  );
};

export default CustomDropdown;

