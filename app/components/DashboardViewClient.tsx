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

interface DashboardProps {
  initialLinks: Link[];
}

const DashboardViewClient: React.FC<DashboardProps> = ({ initialLinks }) => {
  const router = useRouter();
  const [links, setLinks] = useState<Link[]>(initialLinks);
  const [mode, setMode] = useState<DashboardMode>('normal');
  const [currentEditLink, setCurrentEditLink] = useState<Link | null>(null);
  const [currentDeleteLink, setCurrentDeleteLink] = useState<Link | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    setLinks(initialLinks);
  }, [initialLinks]);

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
    try {
      const response = await fetch('/api/reorder', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
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
        />
      )}

      {showEditModal && currentEditLink && (
        <EditLinkModal
          isOpen={showEditModal}
          onClose={handleCloseEditModal}
          link={currentEditLink}
          onSave={handleEditSave}
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
        {links.length === 0 ? (
          <EmptyState onAddLink={() => setShowAddModal(true)} />
        ) : (
          <DesktopGrid
            links={links}
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
