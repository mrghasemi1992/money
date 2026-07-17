import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { useAppliedTheme, useAppliedLocale } from '@/stores';
import { AppShell } from '@/components';
import { DesignSystemPage } from './pages/design-system';
import { DashboardPage } from './pages/dashboard';
import { TransactionsPage } from './pages/transactions';
import { ReportsPage } from './pages/reports';
import { BudgetsPage } from './pages/budgets';

export function App() {
  useAppliedTheme();
  useAppliedLocale();

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppShell />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/transactions" element={<TransactionsPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/budgets" element={<BudgetsPage />} />
        </Route>
        <Route path="/design-system" element={<DesignSystemPage />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}