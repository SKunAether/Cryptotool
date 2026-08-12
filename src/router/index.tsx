import { Routes, Route } from 'react-router-dom';
import { Dashboard } from '../features/dashboard/Dashboard';
import { HashView } from '../features/providers/HashView';
import { CryptoView } from '../features/providers/CryptoView';
import { EncodeView } from '../features/providers/EncodeView';
import { CrackView } from '../features/providers/CrackView';
import { AnalyzerView } from '../features/providers/AnalyzerView';
import { ProviderPage } from '../features/providers/ProviderPage';
import { SettingsView } from '../features/settings/SettingsView';

export function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/hash" element={<HashView />} />
      <Route path="/encode" element={<EncodeView />} />
      <Route path="/crack" element={<CrackView />} />
      <Route path="/provider/hash" element={<HashView />} />
      <Route path="/provider/crypto" element={<CryptoView />} />
      <Route path="/provider/crack" element={<CrackView />} />
      <Route path="/provider/analyzer" element={<AnalyzerView />} />
      <Route path="/settings" element={<SettingsView />} />
      <Route path="/provider/:id" element={<ProviderPage />} />
    </Routes>
  );
}