// src/App.tsx
import React, { useState } from 'react';
import { MainLayout } from './components/layout/MainLayout';
import { Dashboard } from './pages/Dashboard';
import { AlertsPage } from './pages/AlertsPage';
import { Settings } from './pages/Settings';
import { NotFound } from './pages/NotFound';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<string>('dashboard');

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'alerts':
        return <AlertsPage />;
      case 'settings':
        return <Settings />;
      default:
        return <NotFound />;
    }
  };

  return (
    <MainLayout currentPage={currentPage} onPageChange={setCurrentPage}>
      {renderPage()}
    </MainLayout>
  );
};

export default App;
