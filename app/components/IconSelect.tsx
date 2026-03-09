'use client';

import Select, { components } from 'react-select';
import { useEffect, useState, useCallback, useRef } from 'react';
import { useId } from 'react';

export interface IconInfo {
  name: string;
  path: string;
}

interface IconSelectProps {
  value?: string | null;
  onChange: (value: string) => void;
}

const DEBOUNCE_DELAY = 300;

const IconSelect = ({ value, onChange }: IconSelectProps) => {
  const [icons, setIcons] = useState<IconInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedValue, setSelectedValue] = useState<string | null>(
    value || null
  );
  const [selectedLabel, setSelectedLabel] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState('');

  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const componentId = useId();

  useEffect(() => {
    if (value !== selectedValue) {
      setSelectedValue(value || null);
      setSelectedLabel(null);
    }
  }, [value, selectedValue]);

  const loadIcons = useCallback(async (query?: string) => {
    try {
      setIsLoading(true);
      const url = query
        ? `/api/icons?q=${encodeURIComponent(query)}`
        : '/api/icons';
      const response = await fetch(url);
      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Failed to load icons');
        return;
      }

      setIcons(data);
      setError(null);
    } catch (err) {
      console.error('Error loading icons:', err);
      setError('Failed to connect to icon API');
    } finally {
      setIsLoading(false);
      setIsSearching(false);
    }
  }, []);

  useEffect(() => {
    loadIcons();
  }, [loadIcons]);

  const handleInputChange = useCallback(
    (newValue: string) => {
      setInputValue(newValue);

      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      if (!newValue.trim()) {
        loadIcons();
        return;
      }

      setIsSearching(true);

      debounceTimerRef.current = setTimeout(() => {
        loadIcons(newValue);
      }, DEBOUNCE_DELAY);

      return newValue;
    },
    [loadIcons]
  );

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  const handleChange = (option: any) => {
    const newValue = option?.value || '';
    const newLabel = option?.label || '';
    setSelectedValue(newValue);
    setSelectedLabel(newLabel);
    setInputValue('');
    loadIcons();
    onChange(newValue);
  };

  const formatOptionLabel = ({
    value,
    label,
  }: {
    value: string;
    label: string;
  }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
      <img
        src={`/icons/${value}`}
        alt=""
        width={20}
        height={20}
        style={{ flexShrink: 0 }}
      />
      <span>{label}</span>
    </div>
  );

  const formatSingleValue = ({
    value,
    label,
  }: {
    value: string;
    label: string;
  }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
      <img
        src={`/icons/${value}`}
        alt=""
        width={20}
        height={20}
        style={{ flexShrink: 0 }}
      />
      <span>{label}</span>
    </div>
  );

  const DropdownIndicator = () => (
    <div style={{ padding: '0 8px', color: '#91a7c3' }}>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M7 10l5 5 5-5z" />
      </svg>
    </div>
  );

  const customStyles = {
    control: (base: any, state: any) => ({
      ...base,
      background: 'rgba(0, 0, 0, 0.2)',
      border: '1px solid rgba(255, 255, 255, 0.12)',
      borderRadius: '0.375rem',
      color: '#d7e3f4',
      fontSize: '0.95rem',
      minHeight: '44px',
      boxShadow: 'none',
      '&:hover': {
        border: '1px solid rgba(255, 255, 255, 0.2)',
      },
    }),
    menu: (base: any) => ({
      ...base,
      background: 'var(--papirus-bg-gradient-end)',
      border: '1px solid rgba(255, 255, 255, 0.12)',
      borderRadius: '0.375rem',
      marginTop: '4px',
      maxHeight: '220px', // Show ~5 items (44px each)
    }),
    menuList: (base: any) => ({
      ...base,
      padding: '4px',
      maxHeight: '220px',
    }),
    option: (base: any, state: any) => ({
      ...base,
      background: state.isSelected
        ? 'rgba(124, 226, 255, 0.1)'
        : state.isFocused
          ? 'rgba(255, 255, 255, 0.05)'
          : 'transparent',
      color: '#d7e3f4',
      cursor: 'pointer',
      borderRadius: '0.25rem',
      padding: '8px 12px',
    }),
    singleValue: (base: any) => ({
      ...base,
      color: '#d7e3f4',
    }),
    input: (base: any) => ({
      ...base,
      color: '#d7e3f4',
    }),
    placeholder: (base: any) => ({
      ...base,
      color: '#91a7c3',
    }),
    dropdownIndicator: (base: any) => ({
      ...base,
      color: '#91a7c3',
      '&:hover': {
        color: '#d7e3f4',
      },
    }),
    clearIndicator: (base: any) => ({
      ...base,
      color: '#91a7c3',
      '&:hover': {
        color: '#f87171',
      },
    }),
    noOptionsMessage: (base: any) => ({
      ...base,
      color: '#91a7c3',
    }),
  };

  // Convert icons to options format
  const options = icons.map(icon => ({
    value: icon.path,
    label: icon.name,
  }));

  // Find current value in options, or create a placeholder if not found (e.g., after search)
  const currentValue =
    options.find(opt => opt.value === selectedValue) ||
    (selectedValue
      ? { value: selectedValue, label: selectedLabel || selectedValue }
      : null);

  if (error) {
    return (
      <div className="icon-select-error">
        <p
          style={{ color: '#f87171', fontSize: '0.875rem', margin: '0.5rem 0' }}
        >
          {error}
        </p>
        <p style={{ color: '#91a7c3', fontSize: '0.75rem', margin: 0 }}>
          Run{' '}
          <code
            style={{
              background: 'rgba(255,255,255,0.1)',
              padding: '2px 6px',
              borderRadius: '4px',
            }}
          >
            npm run index:icons
          </code>{' '}
          to generate the icon cache.
        </p>
      </div>
    );
  }

  return (
    <Select
      instanceId={componentId}
      options={options}
      value={currentValue}
      onChange={handleChange}
      onInputChange={handleInputChange}
      inputValue={inputValue}
      isLoading={isLoading || isSearching}
      isSearchable
      isClearable
      placeholder={
        isLoading
          ? 'Loading icons...'
          : isSearching
            ? 'Searching...'
            : 'Select an icon...'
      }
      formatOptionLabel={formatOptionLabel}
      components={{
        SingleValue: ({ children, ...props }) => (
          <components.SingleValue {...props}>
            {formatSingleValue(props.data as { value: string; label: string })}
          </components.SingleValue>
        ),
        DropdownIndicator,
      }}
      styles={customStyles}
      classNames={{
        menu: () => 'icon-select-menu',
        option: () => 'icon-select-option',
      }}
    />
  );
};

export default IconSelect;
