'use client';

interface EmptyStateProps {
  onAddLink: () => void;
}

const EmptyState = ({ onAddLink }: EmptyStateProps) => {
  return (
    <div className="empty-state-container">
      <div className="empty-state-content">
        <p className="empty-state-description">
          Your dashboard is empty. Add your launcher.
        </p>
        <button
          className="empty-state-add-button"
          onClick={onAddLink}
          aria-label="Add new link"
        >
          <i className="fas fa-plus-circle" aria-hidden="true"></i>
          <span>Add New</span>
        </button>
      </div>
    </div>
  );
};

export default EmptyState;
