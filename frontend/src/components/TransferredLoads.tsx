import React, { useState, useEffect } from "react";
import { getLoadsByStatus } from "../lib/api";
import type { Load } from "../types/index";

const TransferredLoads: React.FC = () => {
  const [loads, setLoads] = useState<Load[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchTransferredLoads();
  }, []);

  const fetchTransferredLoads = async () => {
    try {
      const loadsData = await getLoadsByStatus("transferred");
      setLoads(loadsData);
    } catch (err) {
      console.error("Failed to fetch transferred loads:", err);
    } finally {
      setIsLoading(false);
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
      {/* <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Transferred Loads</h2> */}

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
                Assigned To
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Transferred On
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-neutral-900 divide-y divide-gray-200 dark:divide-neutral-700">
            {loads.map((load) => (
              <tr
                key={load.id}
                className="hover:bg-gray-50 dark:hover:bg-neutral-800"
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                  {load.client_name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {load.client_number}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {load.assigned_to_name || "Unassigned"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {new Date(load.updated_at).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {loads.length === 0 && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            No transferred loads
          </div>
        )}
      </div>
    </div>
  );
};

export default TransferredLoads;
