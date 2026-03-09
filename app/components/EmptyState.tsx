'use client';

interface EmptyStateProps {
  onAddService: () => void;
}

const EmptyState = ({ onAddService }: EmptyStateProps) => {
  return (
    <div className="empty-state-container">
      <div className="empty-state-content">
        <p className="empty-state-description">
          Your dashboard is empty. Add your launcher.
        </p>
        <button
          className="empty-state-add-button"
          onClick={onAddService}
          aria-label="Add new service"
        >
          <i className="fas fa-plus-circle" aria-hidden="true"></i>
          <span>Add Service</span>
        </button>
      </div>
    </div>
  );
};

export default EmptyState;
