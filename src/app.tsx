import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { useAppliedTheme, useAppliedLocale } from '@/stores';
import { DesignSystemPage } from './pages/design-system';

export function App() {
  useAppliedTheme();
  useAppliedLocale();

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/design-system" element={<DesignSystemPage />} />
        <Route path="*" element={<Navigate to="/design-system" replace />} />
      </Routes>
    </BrowserRouter>
  );
}