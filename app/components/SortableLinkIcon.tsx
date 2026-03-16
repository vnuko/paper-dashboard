'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Link } from '@prisma/client';
import LinkIcon from './LinkIcon';

type SortableLinkIconProps = {
  link: Link;
  mode: 'normal' | 'edit' | 'delete' | 'reorder';
  onEdit?: (link: Link) => void;
  onDelete?: (link: Link) => void;
  disabled?: boolean;
};

const SortableLinkIcon = ({
  link,
  mode,
  onEdit,
  onDelete,
  disabled = false,
}: SortableLinkIconProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: link.id, disabled });

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
      <LinkIcon link={link} mode={mode} onEdit={onEdit} onDelete={onDelete} />
    </li>
  );
};

export default SortableLinkIcon;
