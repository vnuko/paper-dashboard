'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DesktopGrid, { DashboardMode } from './DesktopGrid';
import CommandMenu from './CommandMenu';
import EmptyState from './EmptyState';
import ServiceModal from './ServiceModal';
import EditServiceModal from './EditServiceModal';
import DeleteConfirmModal from './DeleteConfirmModal';
import { Dashboard } from '@prisma/client';

interface DashboardProps {
  initialServices: Dashboard[];
}

const DashboardViewClient: React.FC<DashboardProps> = ({ initialServices }) => {
  const router = useRouter();
  const [services, setServices] = useState<Dashboard[]>(initialServices);
  const [mode, setMode] = useState<DashboardMode>('normal');
  const [currentEditService, setCurrentEditService] =
    useState<Dashboard | null>(null);
  const [currentDeleteService, setCurrentDeleteService] =
    useState<Dashboard | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    setServices(initialServices);
  }, [initialServices]);

  const refreshServices = async () => {
    try {
      const response = await fetch('/api/services');
      if (response.ok) {
        const data = await response.json();
        setServices(data);
      }
    } catch (error) {
      console.error('Failed to refresh services:', error);
      router.refresh();
    }
  };

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

  const handleAddComplete = async () => {
    setShowAddModal(false);
    await refreshServices();
  };

  const handleEditSave = async () => {
    setCurrentEditService(null);
    setShowEditModal(false);
    setMode('normal');
    await refreshServices();
  };

  const handleDeleteConfirm = async () => {
    setCurrentDeleteService(null);
    setShowDeleteModal(false);
    setMode('normal');
    await refreshServices();
  };

  const handleReorder = async (newOrder: Dashboard[]) => {
    try {
      const response = await fetch('/api/reorder', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orders: newOrder.map((s, i) => ({ id: s.id, position: i })),
        }),
      });
      if (!response.ok) {
        throw new Error('Failed to reorder');
      }
    } catch (error) {
      console.error(error);
      await refreshServices();
    }
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
        {services.length === 0 ? (
          <EmptyState onAddService={() => setShowAddModal(true)} />
        ) : (
          <DesktopGrid
            services={services}
            mode={mode}
            onEdit={handleServiceEditClick}
            onDelete={handleServiceDeleteClick}
            onReorder={handleReorder}
          />
        )}
      </div>
    </>
  );
};

export default DashboardViewClient;
