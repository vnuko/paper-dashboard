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
import SortableServiceIcon from './SortableServiceIcon';
import type { Dashboard } from '@prisma/client';

export type DashboardMode = 'normal' | 'edit' | 'delete' | 'reorder';

type DesktopGridProps = {
  services: Dashboard[];
  mode: DashboardMode;
  onEdit?: (service: Dashboard) => void;
  onDelete?: (service: Dashboard) => void;
  onReorder?: (newOrder: Dashboard[]) => void;
};

const DesktopGrid = ({
  services,
  mode = 'normal',
  onEdit,
  onDelete,
  onReorder,
}: DesktopGridProps) => {
  const [localServices, setLocalServices] = useState<Dashboard[]>(services);

  useEffect(() => {
    setLocalServices(services);
  }, [services]);

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
      const oldIndex = localServices.findIndex(s => s.id === active.id);
      const newIndex = localServices.findIndex(s => s.id === over.id);
      const newOrder = arrayMove(localServices, oldIndex, newIndex);
      setLocalServices(newOrder);
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
        items={localServices.map(s => s.id)}
        strategy={rectSortingStrategy}
      >
        <ul
          className="desktop-grid"
          role="grid"
          aria-label="Dashboard services"
        >
          {localServices.map(service => (
            <SortableServiceIcon
              key={service.id}
              service={service}
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
