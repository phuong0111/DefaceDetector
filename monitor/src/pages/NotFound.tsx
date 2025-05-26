// src/pages/NotFound.tsx
import React from 'react';

export const NotFound: React.FC = () => {
    return (
        <div className="flex flex-col items-center justify-center h-64">
            <h1 className="text-6xl font-bold text-gray-400 mb-4">404</h1>
            <p className="text-xl text-gray-600 mb-4">Page Not Found</p>
            <p className="text-gray-500">The page you're looking for doesn't exist.</p>
        </div>
    );
};
