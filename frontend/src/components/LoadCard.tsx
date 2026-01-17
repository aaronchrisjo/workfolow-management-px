import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import type { Load } from '../types/index';

interface LoadCardProps {
  load: Load;
  onDoubleClick?: (load: Load) => void;
}

const LoadCard: React.FC<LoadCardProps> = ({ load, onDoubleClick }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useDraggable({ id: load.id });

  const style = {
    transform: transform ? `translate(${transform.x}px, ${transform.y}px)` : undefined,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDoubleClick?.(load);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onDoubleClick={handleDoubleClick}
      className="bg-white dark:bg-neutral-900 p-3 rounded-md shadow-sm border border-gray-200 dark:border-neutral-700 hover:shadow-md cursor-grab active:cursor-grabbing"
    >
      <div className="flex justify-between items-start mb-2">
        <h4 className="font-medium text-gray-900 dark:text-white text-sm">{load.client_name}</h4>
        <span className="text-xs text-gray-500 dark:text-gray-400">#{load.client_number}</span>
      </div>

      {load.assigned_to_name && (
        <div className="flex items-center text-xs text-gray-600 dark:text-gray-400 mb-1">
          <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
          </svg>
          {load.assigned_to_name}
        </div>
      )}

      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-500">
        <span>{new Date(load.created_at).toLocaleDateString()}</span>
        <span className="flex items-center gap-1">
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
          </svg>
          {load.employee_count ?? 1}
        </span>
      </div>
    </div>
  );
};

export default LoadCard;
