import React, { useState } from 'react';

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

function KanbanBoard<T extends { id: string }>({
  items,
  columns,
  getItemStatus,
  onStatusChange,
  onItemClick,
  renderCard,
  isLoading = false,
}: KanbanBoardProps<T>) {
  const [draggedItem, setDraggedItem] = useState<T | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);

  const handleDragStart = (e: React.DragEvent, item: T) => {
    setDraggedItem(item);
    e.dataTransfer.effectAllowed = 'move';
    // Add visual feedback
    const target = e.currentTarget as HTMLElement;
    setTimeout(() => {
      target.style.opacity = '0.5';
    }, 0);
  };

  const handleDragEnd = (e: React.DragEvent) => {
    const target = e.currentTarget as HTMLElement;
    target.style.opacity = '1';
    setDraggedItem(null);
    setDragOverColumn(null);
  };

  const handleDragOver = (e: React.DragEvent, columnKey: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverColumn(columnKey);
  };

  const handleDragLeave = () => {
    setDragOverColumn(null);
  };

  const handleDrop = (e: React.DragEvent, columnKey: string) => {
    e.preventDefault();
    setDragOverColumn(null);

    if (draggedItem && getItemStatus(draggedItem) !== columnKey) {
      onStatusChange(draggedItem.id, columnKey);
    }
    setDraggedItem(null);
  };

  const getColumnItems = (columnKey: string) => {
    return items.filter((item) => getItemStatus(item) === columnKey);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Загрузка...</div>
      </div>
    );
  }

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {columns.map((column) => {
        const columnItems = getColumnItems(column.key);
        const isOver = dragOverColumn === column.key;

        return (
          <div
            key={column.key}
            className={`flex-shrink-0 w-72 rounded-lg transition-all ${
              isOver ? 'ring-2 ring-blue-500 ring-offset-2' : ''
            }`}
            onDragOver={(e) => handleDragOver(e, column.key)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, column.key)}
          >
            {/* Column Header */}
            <div className={`px-3 py-2 rounded-t-lg ${column.bgColor}`}>
              <div className="flex items-center justify-between">
                <span className={`font-semibold text-sm ${column.color}`}>
                  {column.label}
                </span>
                <span className={`px-2 py-0.5 text-xs font-bold rounded-full bg-white/50 ${column.color}`}>
                  {columnItems.length}
                </span>
              </div>
            </div>

            {/* Column Body */}
            <div className={`bg-gray-100 rounded-b-lg p-2 min-h-[400px] space-y-2 ${
              isOver ? 'bg-blue-50' : ''
            }`}>
              {columnItems.length === 0 ? (
                <div className="text-center py-8 text-gray-400 text-sm">
                  Нет элементов
                </div>
              ) : (
                columnItems.map((item) => (
                  <div
                    key={item.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, item)}
                    onDragEnd={handleDragEnd}
                    onClick={() => onItemClick(item)}
                    className={`bg-white rounded-lg shadow-sm border border-gray-200 p-3 cursor-pointer
                      hover:shadow-md hover:border-gray-300 transition-all
                      ${draggedItem?.id === item.id ? 'opacity-50' : ''}`}
                  >
                    {renderCard(item)}
                  </div>
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default KanbanBoard;
