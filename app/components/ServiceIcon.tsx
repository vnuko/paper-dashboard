'use client';

import Image from 'next/image';
import { useState } from 'react';
import { Dashboard } from '@prisma/client';

type ServiceMode = 'normal' | 'edit' | 'delete' | 'reorder';

type ServiceIconProps = {
  service: Dashboard;
  mode: ServiceMode;
  onEdit?: (service: Dashboard) => void;
  onDelete?: (service: Dashboard) => void;
};

const ServiceIcon = ({ service, mode, onEdit, onDelete }: ServiceIconProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const handleEditClick = () => {
    if (onEdit) {
      onEdit(service);
    }
  };

  const handleDeleteClick = () => {
    if (onDelete) {
      onDelete(service);
    }
  };

  const renderIcon = () => (
    <div className="icon-wrapper">
      {!hasError ? (
        <Image
          src={`/icons/${service.iconKey || 'papirus/places/bookmark-missing.svg'}`}
          width={0}
          height={0}
          sizes="100%"
          alt={service.title}
          className={`service-icon ${isLoading ? 'loading' : ''}`}
          onLoad={() => setIsLoading(false)}
          onError={() => {
            setIsLoading(false);
            setHasError(true);
          }}
          unoptimized
        />
      ) : (
        <div className="fallback-icon">
          <Image
            src="/question-mark.svg"
            width={0}
            height={0}
            sizes="100%"
            alt={service.title}
            className="service-icon"
            unoptimized
          />
        </div>
      )}
      {service.badge && <span className="badge">{service.badge}</span>}
    </div>
  );

  const getActionIcon = () => {
    if (mode === 'edit') {
      return 'fa-pencil-alt';
    }
    if (mode === 'delete') {
      return 'fa-trash-alt';
    }
    return null;
  };

  const actionIcon = getActionIcon();

  // Normal mode: Link that navigates to URL
  if (mode === 'normal') {
    return (
      <a
        href={service.url}
        target="_blank"
        rel="noopener noreferrer"
        className="desktop-grid__tile"
        title={service.description || service.title}
      >
        {renderIcon()}
        <div className="desktop-grid__label">
          <span>{service.title}</span>
          {!hasError && service.description && (
            <span className="visually-hidden service-description">
              {service.description}
            </span>
          )}
        </div>
      </a>
    );
  }

  // Reorder mode: Draggable div
  if (mode === 'reorder') {
    return (
      <div
        className="desktop-grid__tile mode-reorder"
        title={`Drag to reorder ${service.title}`}
      >
        {renderIcon()}
        <div className="desktop-grid__label">
          <span>{service.title}</span>
          {!hasError && service.description && (
            <span className="visually-hidden service-description">
              {service.description}
            </span>
          )}
        </div>
        <i className="fas fa-arrows-alt"></i>
      </div>
    );
  }

  // Edit/Delete mode: Button with action icon inside
  return (
    <button
      type="button"
      className={`desktop-grid__tile mode-${mode}`}
      onClick={mode === 'edit' ? handleEditClick : handleDeleteClick}
      title={
        mode === 'edit' ? `Edit ${service.title}` : `Delete ${service.title}`
      }
    >
      {renderIcon()}
      <div className="desktop-grid__label">
        <span>{service.title}</span>
        {!hasError && service.description && (
          <span className="visually-hidden service-description">
            {service.description}
          </span>
        )}
      </div>
      {actionIcon && <i className={`fas ${actionIcon}`}></i>}
    </button>
  );
};

export default ServiceIcon;
