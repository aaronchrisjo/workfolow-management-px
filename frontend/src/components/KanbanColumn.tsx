import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import type { Load, LoadStatus } from '../types/index';
import LoadCard from './LoadCard';

interface KanbanColumnProps {
  status: LoadStatus;
  label: string;
  color: string;
  loads: Load[];
}

const KanbanColumn: React.FC<KanbanColumnProps> = ({ status, label, color, loads }) => {
  const { setNodeRef } = useDroppable({
    id: status,
  });

  return (
    <div className="flex flex-col h-full">
      <div className={`${color} px-4 py-3 rounded-t-lg`}>
        <h3 className="font-semibold text-gray-800">{label}</h3>
        <span className="text-sm text-gray-600">{loads.length}</span>
      </div>

      <div
        ref={setNodeRef}
        className="flex-1 bg-gray-50 p-3 rounded-b-lg min-h-[500px] space-y-2"
      >
        {loads.map(load => (
          <LoadCard key={load.id} load={load} />
        ))}

        {loads.length === 0 && (
          <div className="text-center text-gray-400 text-sm mt-4">
            No loads
          </div>
        )}
      </div>
    </div>
  );
};

export default KanbanColumn;
