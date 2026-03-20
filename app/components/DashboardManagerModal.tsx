'use client';

import { useState, useEffect } from 'react';
import type { DashboardInfo } from './DashboardSelect';

interface DashboardManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  dashboards: DashboardInfo[];
  onDashboardsChange: (dashboards: DashboardInfo[]) => void;
}

interface FormData {
  title: string;
  description: string;
}

const DashboardManagerModal = ({
  isOpen,
  onClose,
  dashboards,
  onDashboardsChange,
}: DashboardManagerModalProps) => {
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  const startEdit = (dashboard: DashboardInfo) => {
    setEditingId(dashboard.id);
    setFormData({
      title: dashboard.title,
      description: dashboard.description || '',
    });
    setError(null);
    setShowForm(true);
  };

  const startNew = () => {
    setEditingId(null);
    setFormData({ title: '', description: '' });
    setError(null);
    setShowForm(true);
  };

  const cancelForm = () => {
    setEditingId(null);
    setFormData({ title: '', description: '' });
    setError(null);
    setShowForm(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      setError('Title is required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (editingId) {
        const response = await fetch(`/api/dashboards/${editingId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title: formData.title.trim(),
            description: formData.description.trim() || null,
          }),
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.message || 'Failed to update dashboard');
        }

        onDashboardsChange(
          dashboards.map(d =>
            d.id === editingId
              ? { ...d, title: result.title, description: result.description }
              : d
          )
        );

        setEditingId(null);
        setFormData({ title: '', description: '' });
        setShowForm(false);
      } else {
        const response = await fetch('/api/dashboards', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title: formData.title.trim(),
            description: formData.description.trim() || null,
          }),
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.message || 'Failed to create dashboard');
        }

        onDashboardsChange([
          ...dashboards,
          {
            id: result.id,
            title: result.title,
            description: result.description,
          },
        ]);

        setFormData({ title: '', description: '' });
        setShowForm(false);
      }
    } catch (err) {
      console.error('Error saving dashboard:', err);
      setError(err instanceof Error ? err.message : 'Failed to save dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeleteError(null);

    try {
      const response = await fetch(`/api/dashboards/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.message || 'Failed to delete dashboard');
      }

      onDashboardsChange(dashboards.filter(d => d.id !== id));
    } catch (err) {
      console.error('Error deleting dashboard:', err);
      setDeleteError(
        err instanceof Error ? err.message : 'Failed to delete dashboard'
      );
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
            Manage Dashboards
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
          {deleteError && (
            <div className="service-modal-error" role="alert">
              {deleteError}
            </div>
          )}

          <h3 className="dashboard-section-title">Dashboards</h3>
          <div className="dashboard-list">
            <ul className="dashboard-list-items">
              {dashboards.map(dashboard => (
                <li key={dashboard.id} className="dashboard-list-item">
                  <div className="dashboard-list-item-content">
                    <span className="dashboard-list-item-title">
                      {dashboard.title}
                    </span>
                    {dashboard.description && (
                      <span className="dashboard-list-item-description">
                        {dashboard.description}
                      </span>
                    )}
                  </div>
                  <div className="dashboard-list-item-actions">
                    <button
                      type="button"
                      className="dashboard-list-item-edit"
                      onClick={() => startEdit(dashboard)}
                      aria-label={`Edit ${dashboard.title}`}
                    >
                      <svg
                        viewBox="0 0 24 24"
                        width="16"
                        height="16"
                        fill="currentColor"
                      >
                        <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      className="dashboard-list-item-delete"
                      onClick={() => handleDelete(dashboard.id)}
                      aria-label={`Delete ${dashboard.title}`}
                    >
                      <svg
                        viewBox="0 0 24 24"
                        width="16"
                        height="16"
                        fill="currentColor"
                      >
                        <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
                      </svg>
                    </button>
                  </div>
                </li>
              ))}
              <li>
                <button
                  type="button"
                  className="dashboard-add-btn"
                  onClick={startNew}
                  aria-label="Add new dashboard"
                >
                  <svg
                    viewBox="0 0 24 24"
                    width="20"
                    height="20"
                    fill="currentColor"
                  >
                    <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
                  </svg>
                  <span>Add Dashboard</span>
                </button>
              </li>
            </ul>
          </div>

          {showForm ? (
            <form onSubmit={handleSubmit}>
              <h3 className="dashboard-section-title">
                {editingId ? 'Edit Dashboard' : 'New Dashboard'}
              </h3>
              {error && (
                <div className="service-modal-error" role="alert">
                  {error}
                </div>
              )}

              <div className="service-modal-field">
                <label htmlFor="dashboard-title">Title *</label>
                <input
                  type="text"
                  id="dashboard-title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  className="service-modal-input"
                  placeholder="Enter dashboard title"
                />
              </div>

              <div className="service-modal-field">
                <label htmlFor="dashboard-description">Description</label>
                <input
                  type="text"
                  id="dashboard-description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="service-modal-input"
                  placeholder="Enter description"
                />
              </div>

              <div className="service-modal-actions dashboard-form-actions">
                <button
                  type="button"
                  className="service-modal-cancel-btn btn-sm"
                  onClick={cancelForm}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="service-modal-save-btn btn-sm"
                  disabled={loading}
                >
                  {loading ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          ) : (
            <p className="dashboard-hint">Add or Edit Dashboard</p>
          )}
        </div>
      </div>

      <style jsx>{`
        .dashboard-section-title {
          font-size: 0.875rem;
          font-weight: 600;
          color: #91a7c3;
          margin-bottom: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .dashboard-list {
          margin-bottom: 1.25rem;
        }

        .dashboard-list-items {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .dashboard-list-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.75rem 1rem;
          margin-bottom: 0.5rem;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 0.375rem;
          border: 1px solid rgba(255, 255, 255, 0.08);
          transition: background 0.2s ease;
        }

        .dashboard-list-item:hover {
          background: rgba(255, 255, 255, 0.08);
        }

        .dashboard-list-item-content {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
          flex: 1;
          min-width: 0;
        }

        .dashboard-list-item-title {
          color: #d7e3f4;
          font-weight: 500;
        }

        .dashboard-list-item-description {
          color: #91a7c3;
          font-size: 0.875rem;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .dashboard-list-item-actions {
          display: flex;
          align-items: center;
          gap: 0.25rem;
        }

        .dashboard-list-item-edit {
          background: transparent;
          border: none;
          color: #91a7c3;
          cursor: pointer;
          padding: 0.5rem;
          border-radius: 0.25rem;
          transition:
            color 0.2s ease,
            background 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .dashboard-list-item-edit:hover {
          color: #60a5fa;
          background: rgba(96, 165, 250, 0.1);
        }

        .dashboard-list-item-delete {
          background: transparent;
          border: none;
          color: #91a7c3;
          cursor: pointer;
          padding: 0.5rem;
          border-radius: 0.25rem;
          transition:
            color 0.2s ease,
            background 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .dashboard-list-item-delete:hover {
          color: #f87171;
          background: rgba(248, 113, 113, 0.1);
        }

        .dashboard-add-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          width: 100%;
          padding: 0.75rem 1rem;
          background: transparent;
          border: 2px dashed rgba(255, 255, 255, 0.2);
          border-radius: 0.375rem;
          color: #91a7c3;
          cursor: pointer;
          transition:
            border-color 0.2s ease,
            color 0.2s ease,
            background 0.2s ease;
          font-size: 0.875rem;
          font-weight: 500;
        }

        .dashboard-add-btn:hover {
          border-color: rgba(255, 255, 255, 0.4);
          color: #d7e3f4;
          background: rgba(255, 255, 255, 0.03);
        }

        .dashboard-hint {
          color: #91a7c3;
          font-size: 0.875rem;
          text-align: center;
          padding: 1.5rem 0;
        }

        .dashboard-save-btn {
          width: 100%;
          margin-top: 1rem;
        }

        .dashboard-form-actions {
          justify-content: flex-end;
          gap: 0.75rem;
        }

        .dashboard-form-actions .service-modal-save-btn {
          width: auto;
          margin-top: 0;
        }
      `}</style>
    </div>
  );
};

export default DashboardManagerModal;
