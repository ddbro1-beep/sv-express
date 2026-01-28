import React, { useState } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  closestCenter,
} from '@dnd-kit/core';
import { useDraggable, useDroppable } from '@dnd-kit/core';

export interface KanbanColumn {
  key: string;
  label: string;
  color: string;
  bgColor: string;
}

interface KanbanBoardProps<T extends { id: string }> {
  items: T[];
  columns: KanbanColumn[];
  getItemStatus: (item: T) => string;
  onStatusChange: (id: string, newStatus: string) => void;
  onItemClick: (item: T) => void;
  renderCard: (item: T) => React.ReactNode;
  isLoading?: boolean;
}

// Draggable Card Component
function DraggableCard<T extends { id: string }>({
  item,
  onItemClick,
  renderCard,
  isDragging,
}: {
  item: T;
  onItemClick: (item: T) => void;
  renderCard: (item: T) => React.ReactNode;
  isDragging?: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: item.id,
  });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      onClick={() => onItemClick(item)}
      className={`bg-white rounded-xl shadow-sm border border-gray-100 p-4 cursor-grab active:cursor-grabbing
        hover:shadow-md hover:border-gray-200 transition-all touch-manipulation select-none
        min-h-[100px] ${isDragging ? 'opacity-50 scale-105 shadow-lg z-50' : ''}`}
    >
      {renderCard(item)}
    </div>
  );
}

// Droppable Column Component
function DroppableColumn<T extends { id: string }>({
  column,
  items,
  onItemClick,
  renderCard,
  activeId,
}: {
  column: KanbanColumn;
  items: T[];
  onItemClick: (item: T) => void;
  renderCard: (item: T) => React.ReactNode;
  activeId: string | null;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: column.key,
  });

  return (
    <div
      className={`flex-shrink-0 w-[280px] sm:w-72 lg:w-80 rounded-xl transition-all ${
        isOver ? 'ring-2 ring-blue-500 ring-offset-2' : ''
      }`}
    >
      {/* Column Header */}
      <div className={`px-4 py-3 rounded-t-xl ${column.bgColor}`}>
        <div className="flex items-center justify-between">
          <span className={`font-semibold text-sm ${column.color}`}>
            {column.label}
          </span>
          <span
            className={`px-2.5 py-1 text-xs font-bold rounded-full bg-white/60 ${column.color}`}
          >
            {items.length}
          </span>
        </div>
      </div>

      {/* Column Body */}
      <div
        ref={setNodeRef}
        className={`bg-gray-50 rounded-b-xl p-3 min-h-[400px] space-y-3 transition-colors ${
          isOver ? 'bg-blue-50' : ''
        }`}
      >
        {items.length === 0 ? (
          <div className="text-center py-12 text-gray-400 text-sm">
            Нет элементов
          </div>
        ) : (
          items.map((item) => (
            <DraggableCard
              key={item.id}
              item={item}
              onItemClick={onItemClick}
              renderCard={renderCard}
              isDragging={activeId === item.id}
            />
          ))
        )}
      </div>
    </div>
  );
}

function KanbanBoard<T extends { id: string }>({
  items,
  columns,
  getItemStatus,
  onStatusChange,
  onItemClick,
  renderCard,
  isLoading = false,
}: KanbanBoardProps<T>) {
  const [activeId, setActiveId] = useState<string | null>(null);

  // Configure sensors for both mouse and touch
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Start drag after 8px movement
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200, // 200ms touch hold before drag starts
        tolerance: 5, // 5px movement allowed during delay
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const draggedItemId = active.id as string;
    const targetColumnKey = over.id as string;

    // Find the dragged item
    const draggedItem = items.find((item) => item.id === draggedItemId);
    if (!draggedItem) return;

    const currentStatus = getItemStatus(draggedItem);

    // Only update if dropped on a different column
    if (currentStatus !== targetColumnKey && columns.some((col) => col.key === targetColumnKey)) {
      onStatusChange(draggedItemId, targetColumnKey);
    }
  };

  const getColumnItems = (columnKey: string) => {
    return items.filter((item) => getItemStatus(item) === columnKey);
  };

  const activeItem = activeId ? items.find((item) => item.id === activeId) : null;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-gray-500">Загрузка...</span>
        </div>
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      {/* Scrollable container with snap points on mobile */}
      <div className="overflow-x-auto pb-4 -mx-4 px-4 sm:mx-0 sm:px-0">
        <div className="flex gap-4 min-w-min">
          {columns.map((column) => (
            <DroppableColumn
              key={column.key}
              column={column}
              items={getColumnItems(column.key)}
              onItemClick={onItemClick}
              renderCard={renderCard}
              activeId={activeId}
            />
          ))}
        </div>
      </div>

      {/* Drag Overlay for smooth dragging */}
      <DragOverlay>
        {activeItem ? (
          <div className="bg-white rounded-xl shadow-2xl border border-blue-200 p-4 min-w-[260px] opacity-90 rotate-2 scale-105">
            {renderCard(activeItem)}
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

export default KanbanBoard;
