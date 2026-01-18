import React, { useMemo, useState } from "react";
import type { Load, User } from "../types/index";
import PersonalDashboard from "./PersonalDashboard";

interface EmployeeAllocationStatsProps {
  isOpen: boolean;
  onClose: () => void;
  loads: Load[];
  users: User[];
}

const EmployeeAllocationStats: React.FC<EmployeeAllocationStatsProps> = ({
  isOpen,
  onClose,
  loads,
  users,
}) => {
  const [selectedEmployee, setSelectedEmployee] = useState<User | null>(null);
  const today = new Date().toDateString();

  const stats = useMemo(() => {
    const todayLoads = loads.filter(
      (load) => new Date(load.created_at).toDateString() === today
    );

    const filteredUsers = users
      .filter((user) => user.role === "employee" || user.role === "allocator")
      .sort((a, b) => a.name.localeCompare(b.name));

    const userStats = filteredUsers.map((user) => {
      const userLoads = todayLoads.filter(
        (load) => load.assigned_to === user.id
      );
      const completedLoads = userLoads.filter(
        (load) => load.status === "completed"
      );
      const totalEmployees = userLoads.reduce(
        (sum, load) => sum + (load.employee_count || 1),
        0
      );

      return {
        id: user.id,
        name: user.name,
        role: user.role,
        loadsAssigned: userLoads.length,
        loadsCompleted: completedLoads.length,
        totalEmployees,
      };
    });

    const grandTotalEmployees = todayLoads.reduce(
      (sum, load) => sum + (load.employee_count || 1),
      0
    );

    const grandTotalLoads = todayLoads.length;
    const grandTotalCompleted = todayLoads.filter(
      (load) => load.status === "completed"
    ).length;

    return {
      userStats,
      grandTotalEmployees,
      grandTotalLoads,
      grandTotalCompleted,
    };
  }, [loads, users, today]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-neutral-900 rounded-lg shadow-xl w-full max-w-3xl max-h-[80vh] overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-neutral-700">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Daily Allocation Summary
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[60vh]">
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {stats.grandTotalLoads}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Total Loads Today
              </p>
            </div>
            <div className="bg-green-50 dark:bg-green-900/30 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {stats.grandTotalCompleted}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Completed Today
              </p>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/30 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {stats.grandTotalEmployees}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Total Employees
              </p>
            </div>
          </div>

          <table className="min-w-full divide-y divide-gray-200 dark:divide-neutral-700">
            <thead className="bg-gray-50 dark:bg-black">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Loads Assigned
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Completed
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Total Employees
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-neutral-900 divide-y divide-gray-200 dark:divide-neutral-700">
              {stats.userStats.map((stat) => {
                const employee = users.find((u) => u.id === stat.id);
                return (
                <tr
                  key={stat.id}
                  onClick={() => employee && setSelectedEmployee(employee)}
                  className="cursor-pointer transition-all duration-150 hover:bg-gray-50 dark:hover:bg-neutral-800 hover:shadow-md hover:scale-[1.01] hover:-translate-y-0.5"
                >
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    {stat.name}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 text-center">
                    {stat.loadsAssigned}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-center">
                    <span
                      className={`${
                        stat.loadsCompleted > 0
                          ? "text-green-600 dark:text-green-400"
                          : "text-gray-500 dark:text-gray-400"
                      }`}
                    >
                      {stat.loadsCompleted}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 text-center">
                    {stat.totalEmployees}
                  </td>
                </tr>
              );
              })}
            </tbody>
          </table>

          {stats.userStats.length === 0 && (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              No users found
            </div>
          )}
        </div>
      </div>

      {selectedEmployee && (
        <PersonalDashboard
          isOpen={!!selectedEmployee}
          onClose={() => setSelectedEmployee(null)}
          user={selectedEmployee}
          loads={loads}
        />
      )}
    </div>
  );
};

export default EmployeeAllocationStats;
