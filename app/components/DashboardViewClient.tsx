'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DesktopGrid, { DashboardMode } from './DesktopGrid';
import CommandMenu from './CommandMenu';
import EmptyState from './EmptyState';
import LinkModal from './LinkModal';
import EditLinkModal from './EditLinkModal';
import DeleteConfirmModal from './DeleteConfirmModal';
import { Link } from '@prisma/client';
import type { DashboardInfo } from './DashboardSelect';

interface DashboardProps {
  initialLinks: Link[];
  initialDashboards: DashboardInfo[];
}

const DashboardViewClient: React.FC<DashboardProps> = ({
  initialLinks,
  initialDashboards,
}) => {
  const router = useRouter();
  const [links, setLinks] = useState<Link[]>(initialLinks);
  const [dashboards, setDashboards] =
    useState<DashboardInfo[]>(initialDashboards);
  const [selectedDashboardId, setSelectedDashboardId] = useState<string | null>(
    initialDashboards[0]?.id || null
  );
  const [mode, setMode] = useState<DashboardMode>('normal');
  const [currentEditLink, setCurrentEditLink] = useState<Link | null>(null);
  const [currentDeleteLink, setCurrentDeleteLink] = useState<Link | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    setLinks(initialLinks);
  }, [initialLinks]);

  useEffect(() => {
    setDashboards(initialDashboards);
    if (initialDashboards.length > 0 && !selectedDashboardId) {
      setSelectedDashboardId(initialDashboards[0].id);
    }
  }, [initialDashboards, selectedDashboardId]);

  const filteredLinks = selectedDashboardId
    ? links.filter(link => link.dashboardId === selectedDashboardId)
    : links;

  const refreshLinks = async () => {
    try {
      const response = await fetch('/api/links');
      if (response.ok) {
        const data = await response.json();
        setLinks(data);
      }
    } catch (error) {
      console.error('Failed to refresh links:', error);
      router.refresh();
    }
  };

  const refreshDashboards = async () => {
    try {
      const response = await fetch('/api/dashboards');
      if (response.ok) {
        const data = await response.json();
        setDashboards(data);
        if (data.length > 0 && !selectedDashboardId) {
          setSelectedDashboardId(data[0].id);
        }
      }
    } catch (error) {
      console.error('Failed to refresh dashboards:', error);
    }
  };

  const handleLinkEditClick = (link: Link) => {
    setCurrentEditLink(link);
    setShowEditModal(true);
  };

  const handleLinkDeleteClick = (link: Link) => {
    setCurrentDeleteLink(link);
    setShowDeleteModal(true);
  };

  const handleCloseAddModal = () => {
    setShowAddModal(false);
  };

  const handleCloseEditModal = () => {
    setCurrentEditLink(null);
    setShowEditModal(false);
  };

  const handleCloseDeleteModal = () => {
    setCurrentDeleteLink(null);
    setShowDeleteModal(false);
  };

  const handleAddComplete = async () => {
    setShowAddModal(false);
    await refreshLinks();
  };

  const handleEditSave = async () => {
    setCurrentEditLink(null);
    setShowEditModal(false);
    setMode('normal');
    await refreshLinks();
  };

  const handleDeleteConfirm = async () => {
    setCurrentDeleteLink(null);
    setShowDeleteModal(false);
    setMode('normal');
    await refreshLinks();
  };

  const handleReorder = async (newOrder: Link[]) => {
    if (!selectedDashboardId) return;

    try {
      const response = await fetch('/api/reorder', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dashboardId: selectedDashboardId,
          orders: newOrder.map((l, i) => ({ id: l.id, position: i })),
        }),
      });
      if (!response.ok) {
        throw new Error('Failed to reorder');
      }
    } catch (error) {
      console.error(error);
      await refreshLinks();
    }
  };

  return (
    <>
      {showAddModal && (
        <LinkModal
          isOpen={showAddModal}
          onClose={handleCloseAddModal}
          onAdd={handleAddComplete}
          selectedDashboardId={selectedDashboardId}
          dashboards={dashboards}
        />
      )}

      {showEditModal && currentEditLink && (
        <EditLinkModal
          isOpen={showEditModal}
          onClose={handleCloseEditModal}
          link={currentEditLink}
          onSave={handleEditSave}
          dashboards={dashboards}
        />
      )}

      {showDeleteModal && currentDeleteLink && (
        <DeleteConfirmModal
          isOpen={showDeleteModal}
          onClose={handleCloseDeleteModal}
          link={currentDeleteLink}
          onConfirm={handleDeleteConfirm}
        />
      )}

      <div className="page-container">
        <CommandMenu
          mode={mode}
          onModeChange={setMode}
          onEditLink={handleLinkEditClick}
          onDeleteLink={handleLinkDeleteClick}
        />
        {filteredLinks.length === 0 ? (
          <EmptyState onAddLink={() => setShowAddModal(true)} />
        ) : (
          <DesktopGrid
            links={filteredLinks}
            mode={mode}
            onEdit={handleLinkEditClick}
            onDelete={handleLinkDeleteClick}
            onReorder={handleReorder}
          />
        )}
      </div>
    </>
  );
};

export default DashboardViewClient;
