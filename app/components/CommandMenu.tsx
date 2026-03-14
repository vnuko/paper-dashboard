'use client';

import { useState, useEffect, useRef } from 'react';
import ServiceModal from './ServiceModal';
import { Dashboard } from '@prisma/client';
import { DashboardMode } from './DesktopGrid';

interface CommandMenuProps {
  mode: DashboardMode;
  onModeChange: (mode: DashboardMode) => void;
  onEditService?: (service: Dashboard) => void;
  onDeleteService?: (service: Dashboard) => void;
}

const CommandMenu: React.FC<CommandMenuProps> = ({
  mode = 'normal',
  onModeChange,
  onEditService,
  onDeleteService,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const firstMenuItemRef = useRef<HTMLButtonElement>(null);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      setTimeout(() => firstMenuItemRef.current?.focus(), 0);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen && toggleRef.current) {
      toggleRef.current.focus();
    }
  }, [isOpen]);

  const openAddModal = () => {
    setIsOpen(false);
    setShowAddModal(true);
  };

  const handleModeToggle = (newMode: DashboardMode) => {
    onModeChange(newMode);
  };

  const handleAddComplete = () => {
    window.location.reload();
  };

  const getModeButtonText = () => {
    if (mode === 'edit') return 'Exit Edit';
    return 'Edit';
  };

  const getModeButtonIcon = () => {
    if (mode === 'edit') return 'fas fa-check-circle';
    if (mode === 'delete') return 'fas fa-check-circle';
    return 'fas fa-edit';
  };

  return (
    <>
      <ServiceModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={handleAddComplete}
      />

      <button
        ref={toggleRef}
        className="command-menu-toggle"
        onClick={toggleMenu}
        aria-label="Open menu"
        aria-expanded={isOpen}
      >
        <svg
          viewBox="0 0 24 24"
          width="24"
          height="24"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M0 0h24v24H0z" fill="none" />
          <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" />
        </svg>
      </button>

      {isOpen && (
        <div
          className="command-menu-overlay"
          onClick={toggleMenu}
          aria-hidden="true"
        />
      )}

      <div
        ref={menuRef}
        className={`command-menu-panel ${isOpen ? 'command-menu-panel--open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="command-menu-title"
      >
        <div className="command-menu-header">
          <h2 id="command-menu-title" className="command-menu-title">
            Menu
          </h2>
          <button
            className="command-menu-close"
            onClick={toggleMenu}
            aria-label="Close menu"
          >
            <svg
              viewBox="0 0 24 24"
              width="24"
              height="24"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M0 0h24v24H0z" fill="none" />
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
            </svg>
          </button>
        </div>

        <ul className="command-menu-list">
          <li className="command-menu-item">
            <button
              ref={isOpen ? firstMenuItemRef : null}
              className="command-menu-button"
              onClick={openAddModal}
            >
              <i className="fas fa-plus-circle"></i>
              <span>Add</span>
            </button>
          </li>
          <li className="command-menu-item">
            <button
              className={`command-menu-button ${mode === 'edit' ? 'edit-mode-active' : ''}`}
              onClick={() =>
                handleModeToggle(mode === 'edit' ? 'normal' : 'edit')
              }
            >
              <i className={getModeButtonIcon()}></i>
              <span>{getModeButtonText()}</span>
            </button>
          </li>
          <li className="command-menu-item">
            <button
              className={`command-menu-button ${mode === 'reorder' ? 'reorder-mode-active' : ''}`}
              onClick={() =>
                handleModeToggle(mode === 'reorder' ? 'normal' : 'reorder')
              }
            >
              <i
                className={
                  mode === 'reorder'
                    ? 'fas fa-check-circle'
                    : 'fas fa-arrows-alt'
                }
              ></i>
              <span>{mode === 'reorder' ? 'Exit Reorder' : 'Reorder'}</span>
            </button>
          </li>
          <li className="command-menu-item">
            <button
              className={`command-menu-button ${mode === 'delete' ? 'delete-mode-active' : ''}`}
              onClick={() =>
                handleModeToggle(mode === 'delete' ? 'normal' : 'delete')
              }
            >
              <i className={`fas fa-trash-alt`}></i>
              <span>{mode === 'delete' ? 'Exit Delete' : 'Delete'}</span>
            </button>
          </li>
        </ul>
      </div>
    </>
  );
};

export default CommandMenu;
