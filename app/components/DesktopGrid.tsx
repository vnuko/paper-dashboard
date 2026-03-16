'use client';

import { useState, useEffect } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import SortableLinkIcon from './SortableLinkIcon';
import type { Link } from '@prisma/client';

export type DashboardMode = 'normal' | 'edit' | 'delete' | 'reorder';

type DesktopGridProps = {
  links: Link[];
  mode: DashboardMode;
  onEdit?: (link: Link) => void;
  onDelete?: (link: Link) => void;
  onReorder?: (newOrder: Link[]) => void;
};

const DesktopGrid = ({
  links,
  mode = 'normal',
  onEdit,
  onDelete,
  onReorder,
}: DesktopGridProps) => {
  const [localLinks, setLocalLinks] = useState<Link[]>(links);

  useEffect(() => {
    setLocalLinks(links);
  }, [links]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = localLinks.findIndex(l => l.id === active.id);
      const newIndex = localLinks.findIndex(l => l.id === over.id);
      const newOrder = arrayMove(localLinks, oldIndex, newIndex);
      setLocalLinks(newOrder);
      onReorder?.(newOrder);
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={localLinks.map(l => l.id)}
        strategy={rectSortingStrategy}
      >
        <ul className="desktop-grid" role="grid" aria-label="Dashboard links">
          {localLinks.map(link => (
            <SortableLinkIcon
              key={link.id}
              link={link}
              mode={mode}
              onEdit={onEdit}
              onDelete={onDelete}
              disabled={mode !== 'reorder'}
            />
          ))}
        </ul>
      </SortableContext>
    </DndContext>
  );
};

export default DesktopGrid;
