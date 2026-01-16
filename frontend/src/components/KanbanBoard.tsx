import { useState, useEffect } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import type { DragEndEvent } from "@dnd-kit/core";
import { getLoads, updateLoad, subscribeToLoads } from "../lib/api";
import type { Load, LoadStatus } from "../types/index";
import { useAuth } from "../hooks/useAuth";
import KanbanColumn from "./KanbanColumn";

const STATUSES: { value: LoadStatus; label: string; color: string }[] = [
  { value: "pending", label: "Pending", color: "bg-gray-100 dark:bg-gray-800" },
  {
    value: "in_progress",
    label: "In Progress",
    color: "bg-blue-100 dark:bg-blue-900",
  },
  {
    value: "paused",
    label: "Paused",
    color: "bg-yellow-100 dark:bg-yellow-900",
  },
  {
    value: "completed",
    label: "Completed",
    color: "bg-green-100 dark:bg-green-900",
  },
  {
    value: "transferred",
    label: "Transferred",
    color: "bg-purple-100 dark:bg-purple-900",
  },
];

const KanbanBoard = () => {
  const [loads, setLoads] = useState<Load[]>([]);
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

    const channel = subscribeToLoads((payload) => {
      if (payload.eventType === "INSERT" && payload.new) {
        setLoads((prev) => {
          if (
            user?.role === "employee" &&
            payload.new?.assigned_to !== user.id
          ) {
            return prev;
          }
          return [payload.new!, ...prev];
        });
      } else if (payload.eventType === "UPDATE" && payload.new) {
        setLoads((prev) => {
          if (
            user?.role === "employee" &&
            payload.new?.assigned_to !== user.id
          ) {
            return prev.filter((l) => l.id !== payload.new!.id);
          }
          return prev.map((l) => (l.id === payload.new!.id ? payload.new! : l));
        });
      } else if (payload.eventType === "DELETE" && payload.old) {
        setLoads((prev) => prev.filter((l) => l.id !== payload.old!.id));
      }
    });

    return () => {
      channel.unsubscribe();
    };
  }, [user]);

  const fetchData = async () => {
    try {
      let fetchedLoads = await getLoads();

      if (user?.role === "employee") {
        fetchedLoads = fetchedLoads.filter(
          (load: Load) => load.assigned_to === user.id
        );
      }

      setLoads(fetchedLoads);
    } catch (err) {
      console.error("Failed to fetch data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) return;

    const loadId = active.id.toString();
    const newStatus = over.id as LoadStatus;

    const load = loads.find((l) => l.id === loadId);
    if (!load || load.status === newStatus) return;

    setLoads((prevLoads) =>
      prevLoads.map((l) => (l.id === loadId ? { ...l, status: newStatus } : l))
    );

    try {
      await updateLoad(loadId, { status: newStatus });
    } catch (err) {
      console.error("Failed to update load:", err);
      setLoads((prevLoads) =>
        prevLoads.map((l) =>
          l.id === loadId ? { ...l, status: load.status } : l
        )
      );
      alert("Failed to update load status");
    }
  };

  const getLoadsByStatus = (status: LoadStatus) => {
    return loads.filter((load) => {
      if (load.status !== status) return false;
      
      // For completed loads, only show those completed within the last 48 hours
      if (status === "completed") {
        const completedAt = new Date(load.updated_at);
        const now = new Date();
        const hoursDiff = (now.getTime() - completedAt.getTime()) / (1000 * 60 * 60);
        return hoursDiff <= 48;
      }
      
      return true;
    });
  };

  if (isLoading) {
    return (
      <div className="text-center py-8 text-gray-600 dark:text-gray-400">
        Loading...
      </div>
    );
  }

  return (
    <div>
      {/* <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Kanban Board</h2> */}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-5 gap-4">
          {STATUSES.map((status) => (
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
