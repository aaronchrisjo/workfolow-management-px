import React, { useState, useEffect } from 'react';
import { getLoads, createLoad, updateLoad, deleteLoad, getUsers } from '../lib/api';
import type { Load, User } from '../types/index';
import { useAuth } from '../hooks/useAuth';

const LoadManagement: React.FC = () => {
  const [loads, setLoads] = useState<Load[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    client_name: '',
    client_number: '',
    status: 'pending' as const,
    assigned_to: '',
  });
  const [error, setError] = useState('');
  const { user } = useAuth();

  const canCreateLoads = user?.role === 'admin' || user?.role === 'supervisor' || user?.role === 'allocator';

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [loadsData, usersData] = await Promise.all([
        getLoads(),
        canCreateLoads ? getUsers() : Promise.resolve([])
      ]);
      setLoads(loadsData);
      setUsers(usersData);
    } catch (err) {
      console.error('Failed to fetch data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      await createLoad({
        client_name: formData.client_name,
        client_number: formData.client_number,
        status: formData.status,
        assigned_to: formData.assigned_to || undefined,
      });
      setFormData({ client_name: '', client_number: '', status: 'pending', assigned_to: '' });
      setShowCreateForm(false);
      fetchData();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || 'Failed to create load');
      } else {
        setError('Failed to create load');
      }
    }
  };

  const handleAssign = async (loadId: string, userId: string) => {
    try {
      await updateLoad(loadId, { assigned_to: userId || null });
      fetchData();
    } catch (err) {
      alert('Failed to assign load');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this load?')) return;

    try {
      await deleteLoad(id);
      fetchData();
    } catch (err) {
      alert('Failed to delete load');
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Load Allocations</h2>
        {canCreateLoads && (
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            {showCreateForm ? 'Cancel' : 'Create Load'}
          </button>
        )}
      </div>

      {showCreateForm && canCreateLoads && (
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h3 className="text-lg font-semibold mb-4">Create New Load</h3>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Client Name</label>
              <input
                type="text"
                value={formData.client_name}
                onChange={(e) => setFormData({ ...formData, client_name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Client Number</label>
              <input
                type="text"
                value={formData.client_number}
                onChange={(e) => setFormData({ ...formData, client_number: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as typeof formData.status })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="paused">Paused</option>
                <option value="completed">Completed</option>
                <option value="transferred">Transferred</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Assign To</label>
              <select
                value={formData.assigned_to}
                onChange={(e) => setFormData({ ...formData, assigned_to: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Unassigned</option>
                {users.map(u => (
                  <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
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

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Client
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Client Number
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Assigned To
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Created
              </th>
              {canCreateLoads && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loads.map((load) => (
              <tr key={load.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {load.client_name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {load.client_number}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    load.status === 'completed' ? 'bg-green-100 text-green-800' :
                    load.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                    load.status === 'paused' ? 'bg-yellow-100 text-yellow-800' :
                    load.status === 'transferred' ? 'bg-purple-100 text-purple-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {load.status.replace('_', ' ')}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {canCreateLoads ? (
                    <select
                      value={load.assigned_to || ''}
                      onChange={(e) => handleAssign(load.id, e.target.value)}
                      className="border border-gray-300 rounded px-2 py-1 text-sm"
                    >
                      <option value="">Unassigned</option>
                      {users.map(u => (
                        <option key={u.id} value={u.id}>{u.name}</option>
                      ))}
                    </select>
                  ) : (
                    load.assigned_to_name || 'Unassigned'
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(load.created_at).toLocaleDateString()}
                </td>
                {canCreateLoads && (
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleDelete(load.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
        {loads.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No loads found
          </div>
        )}
      </div>
    </div>
  );
};

export default LoadManagement;
