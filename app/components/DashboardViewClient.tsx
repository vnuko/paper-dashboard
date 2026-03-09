'use client';

import { useState } from 'react';
import DesktopGrid from './DesktopGrid';
import CommandMenu from './CommandMenu';
import EmptyState from './EmptyState';
import ServiceModal from './ServiceModal';
import EditServiceModal from './EditServiceModal';
import DeleteConfirmModal from './DeleteConfirmModal';
import { Dashboard } from '@prisma/client';

type DashboardMode = 'normal' | 'edit' | 'delete';

interface DashboardProps {
  initialServices: Dashboard[];
}

const DashboardViewClient: React.FC<DashboardProps> = ({ initialServices }) => {
  const [mode, setMode] = useState<DashboardMode>('normal');
  const [currentEditService, setCurrentEditService] =
    useState<Dashboard | null>(null);
  const [currentDeleteService, setCurrentDeleteService] =
    useState<Dashboard | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleServiceEditClick = (service: Dashboard) => {
    setCurrentEditService(service);
    setShowEditModal(true);
  };

  const handleServiceDeleteClick = (service: Dashboard) => {
    setCurrentDeleteService(service);
    setShowDeleteModal(true);
  };

  const handleCloseAddModal = () => {
    setShowAddModal(false);
  };

  const handleCloseEditModal = () => {
    setCurrentEditService(null);
    setShowEditModal(false);
  };

  const handleCloseDeleteModal = () => {
    setCurrentDeleteService(null);
    setShowDeleteModal(false);
  };

  const handleAddComplete = () => {
    setShowAddModal(false);
    window.location.reload();
  };

  const handleEditSave = () => {
    setCurrentEditService(null);
    setShowEditModal(false);
    setMode('normal');
    window.location.reload();
  };

  const handleDeleteConfirm = () => {
    setCurrentDeleteService(null);
    setShowDeleteModal(false);
    setMode('normal');
    window.location.reload();
  };

  return (
    <>
      {showAddModal && (
        <ServiceModal
          isOpen={showAddModal}
          onClose={handleCloseAddModal}
          onAdd={handleAddComplete}
        />
      )}

      {showEditModal && currentEditService && (
        <EditServiceModal
          isOpen={showEditModal}
          onClose={handleCloseEditModal}
          service={currentEditService}
          onSave={handleEditSave}
        />
      )}

      {showDeleteModal && currentDeleteService && (
        <DeleteConfirmModal
          isOpen={showDeleteModal}
          onClose={handleCloseDeleteModal}
          service={currentDeleteService}
          onConfirm={handleDeleteConfirm}
        />
      )}

      <div className="page-container">
        <CommandMenu
          mode={mode}
          onModeChange={setMode}
          onEditService={handleServiceEditClick}
          onDeleteService={handleServiceDeleteClick}
        />
        {initialServices.length === 0 ? (
          <EmptyState onAddService={() => setShowAddModal(true)} />
        ) : (
          <DesktopGrid
            services={initialServices}
            mode={mode}
            onEdit={handleServiceEditClick}
            onDelete={handleServiceDeleteClick}
          />
        )}
      </div>
    </>
  );
};

export default DashboardViewClient;
