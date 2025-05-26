// src/components/ui/Header.tsx
import React from 'react';

export const Header: React.FC = () => {
    return (
        <header className="bg-blue-600 text-white p-4 shadow-md">
            <div className="container mx-auto flex items-center justify-between">
                <h1 className="text-2xl font-bold">Wazuh Alert Monitor</h1>
                <div className="text-sm">
                    Monitoring localhost:5001/webhook/wazuh
                </div>
            </div>
        </header>
    );
};

export default Header;
