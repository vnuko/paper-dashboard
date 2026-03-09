'use client';

import { useState } from 'react';
import { Dashboard } from '@prisma/client';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  service: Dashboard;
  onConfirm: () => void;
}

const DeleteConfirmModal = ({
  isOpen,
  onClose,
  service,
  onConfirm,
}: DeleteConfirmModalProps) => {
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/services/${service.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete service');
      }

      onConfirm();
    } catch (error) {
      console.error('Error deleting service:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="service-modal-overlay">
      <div
        className="service-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div className="service-modal-header">
          <h2 id="modal-title" className="service-modal-title">
            Delete Service
          </h2>
          <button
            className="service-modal-close"
            onClick={onClose}
            aria-label="Close modal"
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

        <div className="service-modal-form">
          <div className="delete-confirmation-message">
            <p>
              Are you sure you want to delete <strong>{service.title}</strong>?
            </p>
            <p className="delete-confirmation-warning">
              This action cannot be undone.
            </p>
          </div>

          <div className="service-modal-actions">
            <button
              type="button"
              className="service-modal-cancel-btn"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="button"
              className="service-modal-delete-btn"
              onClick={handleConfirm}
              disabled={loading}
            >
              {loading ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmModal;
