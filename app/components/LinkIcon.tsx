'use client';

import Image from 'next/image';
import { useState } from 'react';
import { Link } from '@prisma/client';

type LinkMode = 'normal' | 'edit' | 'delete' | 'reorder';

type LinkIconProps = {
  link: Link;
  mode: LinkMode;
  onEdit?: (link: Link) => void;
  onDelete?: (link: Link) => void;
};

const LinkIcon = ({ link, mode, onEdit, onDelete }: LinkIconProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const handleEditClick = () => {
    if (onEdit) {
      onEdit(link);
    }
  };

  const handleDeleteClick = () => {
    if (onDelete) {
      onDelete(link);
    }
  };

  const renderIcon = () => (
    <div className="icon-wrapper">
      {!hasError ? (
        <Image
          src={`/icons/${link.iconKey || 'papirus/places/bookmark-missing.svg'}`}
          width={0}
          height={0}
          sizes="100%"
          alt={link.title}
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
            alt={link.title}
            className="service-icon"
            unoptimized
          />
        </div>
      )}
      {link.badge && <span className="badge">{link.badge}</span>}
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

  if (mode === 'normal') {
    return (
      <a
        href={link.url}
        target="_blank"
        rel="noopener noreferrer"
        className="desktop-grid__tile"
        title={link.description || link.title}
      >
        {renderIcon()}
        <div className="desktop-grid__label">
          <span>{link.title}</span>
          {!hasError && link.description && (
            <span className="visually-hidden service-description">
              {link.description}
            </span>
          )}
        </div>
      </a>
    );
  }

  if (mode === 'reorder') {
    return (
      <div
        className="desktop-grid__tile mode-reorder"
        title={`Drag to reorder ${link.title}`}
      >
        {renderIcon()}
        <div className="desktop-grid__label">
          <span>{link.title}</span>
          {!hasError && link.description && (
            <span className="visually-hidden service-description">
              {link.description}
            </span>
          )}
        </div>
        <i className="fas fa-arrows-alt"></i>
      </div>
    );
  }

  return (
    <button
      type="button"
      className={`desktop-grid__tile mode-${mode}`}
      onClick={mode === 'edit' ? handleEditClick : handleDeleteClick}
      title={mode === 'edit' ? `Edit ${link.title}` : `Delete ${link.title}`}
    >
      {renderIcon()}
      <div className="desktop-grid__label">
        <span>{link.title}</span>
        {!hasError && link.description && (
          <span className="visually-hidden service-description">
            {link.description}
          </span>
        )}
      </div>
      {actionIcon && <i className={`fas ${actionIcon}`}></i>}
    </button>
  );
};

export default LinkIcon;
