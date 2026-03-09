'use client';

import { useState, useEffect } from 'react';
import IconSelect from './IconSelect';

interface ServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: () => void;
}

interface FormData {
  title: string;
  description: string;
  url: string;
  iconKey: string;
}

const ServiceModal = ({ isOpen, onClose, onAdd }: ServiceModalProps) => {
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    url: '',
    iconKey: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleIconChange = (value: string) => {
    setFormData(prev => ({ ...prev, iconKey: value }));
  };

  const submitForm = async () => {
    setLoading(true);
    setError(null);

    try {
      // Ensure the URL has a protocol
      let formattedUrl = formData.url.trim();
      if (formattedUrl && !/^https?:\/\//i.test(formattedUrl)) {
        formattedUrl = 'https://' + formattedUrl;
      }

      // Prepare request data
      const requestData = {
        title: formData.title.trim(),
        description: formData.description.trim() || null,
        url: formattedUrl,
        iconKey: formData.iconKey.trim() || null,
      };

      // Submit to API
      const response = await fetch('/api/services', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to create service');
      }

      // Reset form
      setFormData({ title: '', description: '', url: '', iconKey: '' });

      // Close the modal and refresh the services
      onAdd();
      onClose();
    } catch (err) {
      console.error('Error creating service:', err);
      setError(err instanceof Error ? err.message : 'Failed to create service');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitForm();
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
            Add Service
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

        <form onSubmit={handleSubmit} className="service-modal-form">
          {error && (
            <div className="service-modal-error" role="alert">
              {error}
            </div>
          )}

          <div className="service-modal-field">
            <label htmlFor="iconKey">Icon</label>
            <IconSelect value={formData.iconKey} onChange={handleIconChange} />
          </div>

          <div className="service-modal-field">
            <label htmlFor="title">Title *</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="service-modal-input"
              placeholder="Enter title"
            />
          </div>

          <div className="service-modal-field">
            <label htmlFor="description">Description</label>
            <input
              type="text"
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="service-modal-input"
              placeholder="Enter description"
            />
          </div>

          <div className="service-modal-field">
            <label htmlFor="url">URL *</label>
            <input
              type="url"
              id="url"
              name="url"
              value={formData.url}
              onChange={handleChange}
              required
              className="service-modal-input"
              placeholder="https://example.com"
            />
          </div>

          <div className="service-modal-actions">
            <button
              type="button"
              className="service-modal-cancel-btn"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="service-modal-save-btn"
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ServiceModal;
