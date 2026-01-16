import React, { useState, useEffect } from "react";
import {
  getLoads,
  createLoad,
  updateLoad,
  deleteLoad,
  getUsers,
} from "../lib/api";
import type { Load, User } from "../types/index";
import { useAuth } from "../hooks/useAuth";
import ExportLoadsButton from "./ExportLoadsButton";

const LoadManagement: React.FC = () => {
  const [loads, setLoads] = useState<Load[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [filterAssignedTo, setFilterAssignedTo] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [formData, setFormData] = useState({
    client_name: "",
    client_number: "",
    employee_count: 1,
    assigned_to: "",
  });
  const [error, setError] = useState("");
  const { user } = useAuth();

  const canCreateLoads =
    user?.role === "admin" ||
    user?.role === "supervisor" ||
    user?.role === "allocator";

  const canExportLoads =
    user?.role === "admin" || user?.role === "supervisor";

  const filteredLoads = loads.filter((load) => {
    if (!filterAssignedTo) return true;
    if (filterAssignedTo === "unassigned") return !load.assigned_to;
    return load.assigned_to === filterAssignedTo;
  });

  const totalPages = Math.ceil(filteredLoads.length / itemsPerPage);
  const paginatedLoads = filteredLoads.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Reset to page 1 when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [filterAssignedTo]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [loadsData, usersData] = await Promise.all([
        getLoads(),
        getUsers(),
      ]);
      setLoads(loadsData);
      setUsers(usersData);
    } catch (err) {
      console.error("Failed to fetch data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      await createLoad({
        client_name: formData.client_name,
        client_number: formData.client_number,
        employee_count: formData.employee_count,
        assigned_to: formData.assigned_to || undefined,
      });
      setFormData({
        client_name: "",
        client_number: "",
        employee_count: 1,
        assigned_to: "",
      });
      setShowCreateForm(false);
      fetchData();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || "Failed to create load");
      } else {
        setError("Failed to create load");
      }
    }
  };

  const handleAssign = async (loadId: string, userId: string) => {
    try {
      await updateLoad(loadId, { assigned_to: userId || null });
      fetchData();
    } catch (err) {
      alert("Failed to assign load");
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this load?")) return;

    try {
      await deleteLoad(id);
      fetchData();
    } catch (err) {
      alert("Failed to delete load");
    }
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
      <div className="flex justify-end items-center mb-6">
        <div className="flex items-center gap-3">
          {canCreateLoads && (
            <button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              {showCreateForm ? "Cancel" : "Create Load"}
            </button>
          )}
          {canExportLoads && <ExportLoadsButton />}
        </div>
      </div>

      {showCreateForm && canCreateLoads && (
        <div className="bg-white dark:bg-neutral-900 p-6 rounded-lg shadow mb-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">
            Create New Load
          </h3>
          {error && (
            <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Client Name
              </label>
              <input
                type="text"
                value={formData.client_name}
                onChange={(e) =>
                  setFormData({ ...formData, client_name: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-neutral-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-neutral-800 text-gray-900 dark:text-white"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Client Number
              </label>
              <input
                type="text"
                value={formData.client_number}
                onChange={(e) =>
                  setFormData({ ...formData, client_number: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-neutral-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-neutral-800 text-gray-900 dark:text-white"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Employee Count
              </label>
              <input
                type="number"
                min="1"
                value={formData.employee_count}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    employee_count: parseInt(e.target.value) || 1,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-neutral-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-neutral-800 text-gray-900 dark:text-white"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Assign To
              </label>
              <select
                value={formData.assigned_to}
                onChange={(e) =>
                  setFormData({ ...formData, assigned_to: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-neutral-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-neutral-800 text-gray-900 dark:text-white"
              >
                <option value="">Unassigned</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.role})
                  </option>
                ))}
              </select>
            </div>
            <div className="col-span-2">
              <button
                type="submit"
                className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
              >
                Create Load
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white dark:bg-neutral-900 rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-neutral-700">
          <thead className="bg-gray-50 dark:bg-black">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Client
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Client Number
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Employees
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                <select
                  value={filterAssignedTo}
                  onChange={(e) => setFilterAssignedTo(e.target.value)}
                  className="border border-gray-300 dark:border-neutral-600 rounded px-2 py-1 text-sm bg-white dark:bg-neutral-800 text-gray-900 dark:text-white"
                >
                  <option value="">Assigned to</option>
                  <option value="unassigned">Unassigned</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name}
                    </option>
                  ))}
                </select>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Created
              </th>
              {canCreateLoads && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-neutral-900 divide-y divide-gray-200 dark:divide-neutral-700">
            {paginatedLoads.map((load) => (
              <tr key={load.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                  {load.client_name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {load.client_number}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      load.status === "completed"
                        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                        : load.status === "in_progress"
                        ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                        : load.status === "paused"
                        ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
                        : load.status === "transferred"
                        ? "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300"
                        : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
                    }`}
                  >
                    {load.status.replace("_", " ")}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {load.employee_count ?? 1}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {canCreateLoads ? (
                    <select
                      value={load.assigned_to || ""}
                      onChange={(e) => handleAssign(load.id, e.target.value)}
                      className="border border-gray-300 dark:border-neutral-600 rounded px-2 py-1 text-sm bg-white dark:bg-neutral-800 text-gray-900 dark:text-white"
                    >
                      <option value="">Unassigned</option>
                      {users.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    load.assigned_to_name || "Unassigned"
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {new Date(load.created_at).toLocaleDateString()}
                </td>
                {canCreateLoads && (
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleDelete(load.id)}
                      className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                    >
                      Delete
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
        {paginatedLoads.length === 0 && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            {loads.length === 0 ? "No loads found" : "No loads match the selected filter"}
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 text-sm text-gray-600 dark:text-gray-400">
          <span>
            Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
            {Math.min(currentPage * itemsPerPage, filteredLoads.length)} of{" "}
            {filteredLoads.length} loads
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 border border-gray-300 dark:border-neutral-600 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-neutral-800"
            >
              Previous
            </button>
            <span className="px-3 py-1">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border border-gray-300 dark:border-neutral-600 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-neutral-800"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoadManagement;
