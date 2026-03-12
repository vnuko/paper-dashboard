'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Dashboard } from '@prisma/client';
import ServiceIcon from './ServiceIcon';

type SortableServiceIconProps = {
  service: Dashboard;
  mode: 'normal' | 'edit' | 'delete' | 'reorder';
  onEdit?: (service: Dashboard) => void;
  onDelete?: (service: Dashboard) => void;
  disabled?: boolean;
};

const SortableServiceIcon = ({
  service,
  mode,
  onEdit,
  onDelete,
  disabled = false,
}: SortableServiceIconProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: service.id, disabled });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1 : undefined,
  };

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={isDragging ? 'sortable-dragging' : undefined}
      {...(mode === 'reorder' ? attributes : {})}
      {...(mode === 'reorder' ? listeners : {})}
    >
      <ServiceIcon
        service={service}
        mode={mode}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    </li>
  );
};

export default SortableServiceIcon;
