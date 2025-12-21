import React, { useState, useEffect } from 'react';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { getLoads, updateLoad, createLoad, getUsers } from '../lib/api';
import type { Load, LoadStatus, User } from '../types/index';
import { useAuth } from '../context/AuthContext';
import KanbanColumn from './KanbanColumn';
import LoadCard from './LoadCard';

const STATUSES: { value: LoadStatus; label: string; color: string }[] = [
  { value: 'pending', label: 'Pending', color: 'bg-gray-100' },
  { value: 'in_progress', label: 'In Progress', color: 'bg-blue-100' },
  { value: 'paused', label: 'Paused', color: 'bg-yellow-100' },
  { value: 'completed', label: 'Completed', color: 'bg-green-100' },
  { value: 'transferred', label: 'Transferred', color: 'bg-purple-100' },
];

const KanbanBoard: React.FC = () => {
  const [loads, setLoads] = useState<Load[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [loadsRes, usersRes] = await Promise.all([
        getLoads(),
        user?.role !== 'employee' ? getUsers() : Promise.resolve({ data: [] })
      ]);

      // Filter loads for employees - they should only see loads assigned to them
      let filteredLoads = loadsRes.data;
      if (user?.role === 'employee') {
        filteredLoads = loadsRes.data.filter(load => load.assignedTo === user.id);
      }

      setLoads(filteredLoads);
      setUsers(usersRes.data);
    } catch (err) {
      console.error('Failed to fetch data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) return;

    const loadId = parseInt(active.id.toString());
    const newStatus = over.id as LoadStatus;

    const load = loads.find(l => l.id === loadId);
    if (!load || load.status === newStatus) return;

    try {
      await updateLoad(loadId, { status: newStatus });
      setLoads(prevLoads =>
        prevLoads.map(l =>
          l.id === loadId ? { ...l, status: newStatus } : l
        )
      );
    } catch (err) {
      console.error('Failed to update load:', err);
      alert('Failed to update load status');
    }
  };

  const getLoadsByStatus = (status: LoadStatus) => {
    return loads.filter(load => load.status === status);
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Kanban Board</h2>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-5 gap-4">
          {STATUSES.map(status => (
            <KanbanColumn
              key={status.value}
              status={status.value}
              label={status.label}
              color={status.color}
              loads={getLoadsByStatus(status.value)}
            />
          ))}
        </div>
      </DndContext>
    </div>
  );
};

export default KanbanBoard;
