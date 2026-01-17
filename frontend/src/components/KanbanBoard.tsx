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
  const [showAllLoads, setShowAllLoads] = useState(true);
  const { user } = useAuth();

  const canToggleView =
    user?.role === "admin" ||
    user?.role === "supervisor" ||
    user?.role === "allocator";

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

      // Filter by user if showAllLoads is false
      if (canToggleView && !showAllLoads && load.assigned_to !== user?.id) {
        return false;
      }
      
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
    <div className="relative">
      {canToggleView && (
        <button
          onClick={() => setShowAllLoads(!showAllLoads)}
          className={`absolute bottom-4 right-4 z-10 p-3 rounded-full shadow-lg transition-colors ${
            showAllLoads
              ? "bg-blue-600 text-white hover:bg-blue-700"
              : "bg-gray-200 dark:bg-neutral-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-neutral-600"
          }`}
          title={showAllLoads ? "Showing all loads - Click to show only my loads" : "Showing my loads - Click to show all loads"}
        >
          {showAllLoads ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
            </svg>
          )}
        </button>
      )}

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
