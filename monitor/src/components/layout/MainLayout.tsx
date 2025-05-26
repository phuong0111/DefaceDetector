// src/components/layout/MainLayout.tsx
import React from 'react';
import { Header } from '../ui/Header';
import { Sidebar } from './Sidebar';

interface MainLayoutProps {
    children: React.ReactNode;
    currentPage: string;
    onPageChange: (page: string) => void;
}

export const MainLayout: React.FC<MainLayoutProps> = ({
    children,
    currentPage,
    onPageChange
}) => {
    return (
        <div className="min-h-screen bg-gray-50">
            <Header />
            <div className="flex">
                <Sidebar currentPage={currentPage} onPageChange={onPageChange} />
                <main className="flex-1 p-6">
                    {children}
                </main>
            </div>
        </div>
    );
};