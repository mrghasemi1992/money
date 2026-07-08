import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { useAppliedTheme } from './stores/theme-store';
import { useAppliedLocale } from './stores/locale-store';
import { FoundationsPage } from './pages/foundations';

export default function App() {
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
