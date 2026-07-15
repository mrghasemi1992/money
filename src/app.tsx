import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { useAppliedTheme, useAppliedLocale } from '@/stores';
import { FoundationsPage } from './pages/foundations';

export function App() {
  useAppliedTheme();
  useAppliedLocale();

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/foundations" element={<FoundationsPage />} />
        <Route path="*" element={<Navigate to="/foundations" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
