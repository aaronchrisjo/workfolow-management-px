import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Load } from '../types/index';

interface LoadCardProps {
  load: Load;
}

const LoadCard: React.FC<LoadCardProps> = ({ load }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: load.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="bg-white p-3 rounded-md shadow-sm border border-gray-200 hover:shadow-md cursor-grab active:cursor-grabbing"
    >
      <div className="flex justify-between items-start mb-2">
        <h4 className="font-medium text-gray-900 text-sm">{load.clientName}</h4>
        <span className="text-xs text-gray-500">#{load.clientNumber}</span>
      </div>

      {load.assignedToName && (
        <div className="flex items-center text-xs text-gray-600 mb-1">
          <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
          </svg>
          {load.assignedToName}
        </div>
      )}

      <div className="text-xs text-gray-500">
        {new Date(load.createdAt).toLocaleDateString()}
      </div>
    </div>
  );
};

export default LoadCard;
