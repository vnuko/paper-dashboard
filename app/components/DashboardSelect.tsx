'use client';

import Select, { components } from 'react-select';
import { useEffect, useState } from 'react';
import { useId } from 'react';

export interface DashboardInfo {
  id: string;
  title: string;
  description?: string | null;
}

interface DashboardSelectProps {
  value?: string | null;
  onChange: (value: string) => void;
  dashboards?: DashboardInfo[];
}

const DashboardSelect = ({
  value,
  onChange,
  dashboards: propDashboards,
}: DashboardSelectProps) => {
  const [dashboards, setDashboards] = useState<DashboardInfo[]>(
    propDashboards || []
  );
  const [isLoading, setIsLoading] = useState(!propDashboards);
  const [error, setError] = useState<string | null>(null);
  const componentId = useId();

  useEffect(() => {
    if (propDashboards) {
      setDashboards(propDashboards);
      setIsLoading(false);
      return;
    }

    const loadDashboards = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/dashboards');
        const data = await response.json();

        if (!response.ok) {
          setError(data.message || 'Failed to load dashboards');
          return;
        }

        setDashboards(Array.isArray(data) ? data : []);
        setError(null);
      } catch (err) {
        console.error('Error loading dashboards:', err);
        setError('Failed to connect to dashboard API');
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboards();
  }, [propDashboards]);

  const handleChange = (option: any) => {
    onChange(option?.value || '');
  };

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
    }),
    menuList: (base: any) => ({
      ...base,
      padding: '4px',
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
  };

  const options = dashboards.map(dashboard => ({
    value: dashboard.id,
    label: dashboard.title,
  }));

  const currentValue = options.find(opt => opt.value === value) || null;

  if (error) {
    return (
      <div style={{ color: '#f87171', fontSize: '0.875rem' }}>{error}</div>
    );
  }

  const DropdownIndicator = () => (
    <div style={{ padding: '0 8px', color: '#91a7c3' }}>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M7 10l5 5 5-5z" />
      </svg>
    </div>
  );

  return (
    <Select
      instanceId={componentId}
      options={options}
      value={currentValue}
      onChange={handleChange}
      isLoading={isLoading}
      isSearchable={false}
      isClearable={false}
      placeholder={
        isLoading ? 'Loading dashboards...' : 'Select a dashboard...'
      }
      components={{ DropdownIndicator }}
      styles={customStyles}
    />
  );
};

export default DashboardSelect;
