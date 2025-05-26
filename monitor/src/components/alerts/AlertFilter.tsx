// src/components/alerts/AlertFilter.tsx
import React from 'react';

interface AlertFilterProps {
    onFilterChange: (filter: string) => void;
    currentFilter: string;
}

export const AlertFilter: React.FC<AlertFilterProps> = ({ onFilterChange, currentFilter }) => {
    const filters = [
        { value: 'all', label: 'All Alerts' },
        { value: 'critical', label: 'Critical' },
        { value: 'high', label: 'High' },
        { value: 'medium', label: 'Medium' },
        { value: 'low', label: 'Low' }
    ];

    return (
        <div className="mb-4">
            <select
                value={currentFilter}
                onChange={(e) => onFilterChange(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
                {filters.map(filter => (
                    <option key={filter.value} value={filter.value}>
                        {filter.label}
                    </option>
                ))}
            </select>
        </div>
    );
};