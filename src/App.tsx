/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './components/theme-provider';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Calculators } from './pages/Calculators';
import { LabPlanner } from './pages/LabPlanner';
import { ProtocolGenerator } from './pages/ProtocolGenerator';
import { ReagentTracker } from './pages/ReagentTracker';
import { DataVisualizer } from './pages/DataVisualizer';
import { Help } from './pages/Help';
import { Notes } from './pages/Notes';
import { Settings } from './pages/Settings';

export default function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="labflow-theme">
      <Router>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="calculators" element={<Calculators />} />
            <Route path="planner" element={<LabPlanner />} />
            <Route path="protocol" element={<ProtocolGenerator />} />
            <Route path="reagents" element={<ReagentTracker />} />
            <Route path="visualizer" element={<DataVisualizer />} />
            <Route path="notes" element={<Notes />} />
            <Route path="help" element={<Help />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Routes>
      </Router>
    </ThemeProvider>
  );
}
