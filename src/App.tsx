import React, { useState } from 'react';
import { useAuth } from './hooks/useAuth';
import { Login } from './components/Login';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { DriversPage } from './components/DriversPage';
import { InvestorsPage } from './components/InvestorsPage';
import { PaymentsPage } from './components/PaymentsPage';
import { ExpensesPage } from './components/ExpensesPage';
import { PayoutsPage } from './components/PayoutsPage';
import { ReportsPage } from './components/ReportsPage';
import { SettingsPage } from './components/SettingsPage';

function App() {
  const { isAuthenticated } = useAuth();
  const [currentPage, setCurrentPage] = useState('dashboard');

  if (!isAuthenticated) {
    return <Login />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'drivers':
        return <DriversPage />;
      case 'investors':
        return <InvestorsPage />;
      case 'payments':
        return <PaymentsPage />;
      case 'expenses':
        return <ExpensesPage />;
      case 'payouts':
        return <PayoutsPage />;
      case 'reports':
        return <ReportsPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <Layout currentPage={currentPage} onPageChange={setCurrentPage}>
      {renderPage()}
    </Layout>
  );
}

export default App;