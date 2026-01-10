import React, { useState, useEffect } from 'react';
import { getLoadsByStatus, updateLoad } from '../lib/api';
import type { Load } from '../types/index';
import { useAuth } from '../hooks/useAuth';

const PausedLoads: React.FC = () => {
  const [loads, setLoads] = useState<Load[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetchPausedLoads();
  }, []);

  const fetchPausedLoads = async () => {
    try {
      const loadsData = await getLoadsByStatus('paused');
      setLoads(loadsData);
    } catch (err) {
      console.error('Failed to fetch paused loads:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResume = async (loadId: string) => {
    try {
      await updateLoad(loadId, { status: 'in_progress' });
      fetchPausedLoads();
    } catch (err) {
      alert('Failed to resume load');
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Paused Loads</h2>

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
                Assigned To
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Paused Since
              </th>
              {(user?.role === 'admin' || user?.role === 'supervisor' || user?.role === 'allocator') && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loads.map((load) => (
              <tr key={load.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {load.client_name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {load.client_number}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {load.assigned_to_name || 'Unassigned'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(load.updated_at).toLocaleString()}
                </td>
                {(user?.role === 'admin' || user?.role === 'supervisor' || user?.role === 'allocator') && (
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleResume(load.id)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Resume
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
        {loads.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No paused loads
          </div>
        )}
      </div>
    </div>
  );
};

export default PausedLoads;
