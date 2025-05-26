// src/components/layout/Sidebar.tsx
import React from 'react';

interface SidebarProps {
    currentPage: string;
    onPageChange: (page: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentPage, onPageChange }) => {
    const menuItems = [
        { id: 'dashboard', label: 'Dashboard', icon: '📊' },
        { id: 'alerts', label: 'All Alerts', icon: '🚨' },
        { id: 'settings', label: 'Settings', icon: '⚙️' }
    ];

    return (
        <div className="w-64 bg-gray-800 text-white min-h-screen">
            <div className="p-4">
                <h2 className="text-lg font-semibold mb-6">Navigation</h2>
                <nav>
                    {menuItems.map(item => (
                        <button
                            key={item.id}
                            onClick={() => onPageChange(item.id)}
                            className={`w-full text-left px-4 py-3 rounded mb-2 flex items-center space-x-3 transition-colors ${currentPage === item.id
                                    ? 'bg-blue-600 text-white'
                                    : 'text-gray-300 hover:bg-gray-700'
                                }`}
                        >
                            <span>{item.icon}</span>
                            <span>{item.label}</span>
                        </button>
                    ))}
                </nav>
            </div>
        </div>
    );
};
