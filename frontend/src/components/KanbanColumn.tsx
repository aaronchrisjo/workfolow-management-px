import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import type { Load, LoadStatus } from '../types/index';
import LoadCard from './LoadCard';

interface KanbanColumnProps {
  status: LoadStatus;
  label: string;
  color: string;
  loads: Load[];
  onLoadDoubleClick?: (load: Load) => void;
}

const KanbanColumn: React.FC<KanbanColumnProps> = ({ status, label, color, loads, onLoadDoubleClick }) => {
  const { setNodeRef } = useDroppable({
    id: status,
  });

  return (
    <div className="flex flex-col h-full">
      <div className={`${color} px-4 py-3 rounded-t-lg`}>
        <h3 className="font-semibold text-gray-800 dark:text-white">{label}</h3>
        <span className="text-sm text-gray-600 dark:text-gray-300">{loads.length}</span>
      </div>

      <div
        ref={setNodeRef}
        className="flex-1 bg-gray-50 dark:bg-black p-3 rounded-b-lg min-h-[500px] space-y-2"
      >
        {loads.map(load => (
          <LoadCard key={load.id} load={load} onDoubleClick={onLoadDoubleClick} />
        ))}

        {loads.length === 0 && (
          <div className="text-center text-gray-400 dark:text-gray-500 text-sm mt-4">
            No loads
          </div>
        )}
      </div>
    </div>
  );
};

export default KanbanColumn;
