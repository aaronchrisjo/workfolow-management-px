import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../context/ThemeContext';
import Dashboard from './Dashboard';
import KanbanBoard from './KanbanBoard';
import PausedLoads from './PausedLoads';
import TransferredLoads from './TransferredLoads';
import LoadManagement from './LoadManagement';
import UserManagement from './UserManagement';

type Tab = 'dashboard' | 'kanban' | 'paused' | 'transferred' | 'allocations' | 'users';

const Layout: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const tabs: { id: Tab; label: string; icon: string; roles: string[] }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊', roles: ['admin', 'supervisor', 'allocator', 'employee'] },
    { id: 'kanban', label: 'Kanban Tracker', icon: '📋', roles: ['admin', 'supervisor', 'allocator', 'employee'] },
    { id: 'paused', label: 'Paused Loads', icon: '⏸️', roles: ['admin', 'supervisor', 'allocator', 'employee'] },
    { id: 'transferred', label: 'Transferred Loads', icon: '🔄', roles: ['admin', 'supervisor', 'allocator', 'employee'] },
    { id: 'allocations', label: 'Allocations', icon: '📦', roles: ['admin', 'supervisor', 'allocator', 'employee'] },
    { id: 'users', label: 'User Management', icon: '👥', roles: ['admin', 'supervisor'] },
  ];

  const visibleTabs = tabs.filter(tab =>
    user?.role && tab.roles.includes(user.role)
  );

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-black">
      {/* Vertical Sidebar */}
      <aside className="w-64 bg-white dark:bg-neutral-900 border-r border-gray-200 dark:border-neutral-800 flex flex-col">
        {/* Logo/Brand */}
        <div className="p-6 border-b border-gray-200 dark:border-neutral-800">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Paychex</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Workflow Manager</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          {visibleTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors
                ${activeTab === tab.id
                  ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-medium'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-neutral-800'
                }
              `}
            >
              <span className="text-xl">{tab.icon}</span>
              <span className="text-sm">{tab.label}</span>
            </button>
          ))}
        </nav>

        {/* User Info & Actions */}
        <div className="p-4 border-t border-gray-200 dark:border-neutral-800 space-y-3">
          <div className="flex items-center justify-between px-2">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {user?.name}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                {user?.email}
              </p>
            </div>
            <span className="ml-2 px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300">
              {user?.role}
            </span>
          </div>

          <button
            onClick={handleLogout}
            className="w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="bg-white dark:bg-neutral-900 border-b border-gray-200 dark:border-neutral-800 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {visibleTabs.find(t => t.id === activeTab)?.label}
              </h2>
            </div>

            {/* Dark Mode Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-gray-100 dark:bg-neutral-800 hover:bg-gray-200 dark:hover:bg-neutral-700 transition-colors"
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDark ? (
                <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-gray-700" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                </svg>
              )}
            </button>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-black">
          {activeTab === 'dashboard' && <Dashboard />}
          {activeTab === 'kanban' && <KanbanBoard />}
          {activeTab === 'paused' && <PausedLoads />}
          {activeTab === 'transferred' && <TransferredLoads />}
          {activeTab === 'allocations' && <LoadManagement />}
          {activeTab === 'users' && (user?.role === 'admin' || user?.role === 'supervisor') && <UserManagement />}
        </main>
      </div>
    </div>
  );
};

export default Layout;
