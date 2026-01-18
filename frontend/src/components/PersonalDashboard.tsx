import React, { useMemo } from 'react';
import type { Load, User } from '../types/index';

interface PersonalDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  loads: Load[];
}

const PersonalDashboard: React.FC<PersonalDashboardProps> = ({
  isOpen,
  onClose,
  user,
  loads,
}) => {
  const today = new Date().toDateString();

  const stats = useMemo(() => {
    const allUserLoads = loads.filter((load) => load.assigned_to === user.id);
    const todayLoads = allUserLoads.filter(
      (load) => new Date(load.created_at).toDateString() === today
    );

    const todayCompleted = todayLoads.filter((load) => load.status === 'completed');
    const todayPending = todayLoads.filter((load) => load.status === 'pending');
    const todayInProgress = todayLoads.filter((load) => load.status === 'in_progress');
    const todayPaused = todayLoads.filter((load) => load.status === 'paused');

    const todayEmployees = todayLoads.reduce(
      (sum, load) => sum + (load.employee_count || 1),
      0
    );

    const completionRate = todayLoads.length > 0
      ? Math.round((todayCompleted.length / todayLoads.length) * 100)
      : 0;

    const allTimeCompleted = allUserLoads.filter((load) => load.status === 'completed').length;
    const allTimeEmployees = allUserLoads.reduce(
      (sum, load) => sum + (load.employee_count || 1),
      0
    );

    return {
      today: {
        assigned: todayLoads.length,
        completed: todayCompleted.length,
        pending: todayPending.length,
        inProgress: todayInProgress.length,
        paused: todayPaused.length,
        employees: todayEmployees,
        completionRate,
      },
      allTime: {
        total: allUserLoads.length,
        completed: allTimeCompleted,
        employees: allTimeEmployees,
      },
    };
  }, [loads, user.id, today]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-neutral-900 rounded-lg shadow-xl w-full max-w-lg overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-neutral-700">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              My Dashboard
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Personal stats & overview
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Profile Card */}
          <div className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-neutral-800 rounded-lg">
            <div className="w-14 h-14 rounded-full bg-blue-500 flex items-center justify-center text-white text-xl font-bold">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{user.name}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
              <span className="mt-1 px-2 py-0.5 text-xs font-semibold rounded-full bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300 capitalize inline-block">
                {user.role}
              </span>
            </div>
          </div>

          {/* Today's Stats */}
          <div>
            <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3 uppercase tracking-wider">
              Today's Performance
            </h4>
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {stats.today.assigned}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Assigned</p>
              </div>
              <div className="bg-green-50 dark:bg-green-900/30 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {stats.today.completed}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Completed</p>
              </div>
              <div className="bg-purple-50 dark:bg-purple-900/30 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {stats.today.completionRate}%
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Rate</p>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-2 mt-3">
              <div className="bg-gray-50 dark:bg-neutral-800 rounded-lg p-2 text-center">
                <p className="text-lg font-semibold text-yellow-600 dark:text-yellow-400">
                  {stats.today.pending}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Pending</p>
              </div>
              <div className="bg-gray-50 dark:bg-neutral-800 rounded-lg p-2 text-center">
                <p className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                  {stats.today.inProgress}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">In Progress</p>
              </div>
              <div className="bg-gray-50 dark:bg-neutral-800 rounded-lg p-2 text-center">
                <p className="text-lg font-semibold text-orange-600 dark:text-orange-400">
                  {stats.today.paused}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Paused</p>
              </div>
              <div className="bg-gray-50 dark:bg-neutral-800 rounded-lg p-2 text-center">
                <p className="text-lg font-semibold text-indigo-600 dark:text-indigo-400">
                  {stats.today.employees}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Employees</p>
              </div>
            </div>
          </div>

          {/* All Time Stats */}
          <div>
            <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3 uppercase tracking-wider">
              All Time
            </h4>
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-gray-50 dark:bg-neutral-800 rounded-lg p-3 text-center">
                <p className="text-xl font-bold text-gray-700 dark:text-gray-300">
                  {stats.allTime.total}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Total Loads</p>
              </div>
              <div className="bg-gray-50 dark:bg-neutral-800 rounded-lg p-3 text-center">
                <p className="text-xl font-bold text-gray-700 dark:text-gray-300">
                  {stats.allTime.completed}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Completed</p>
              </div>
              <div className="bg-gray-50 dark:bg-neutral-800 rounded-lg p-3 text-center">
                <p className="text-xl font-bold text-gray-700 dark:text-gray-300">
                  {stats.allTime.employees}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Employees</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonalDashboard;
