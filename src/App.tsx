import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { CRMProvider } from './context/CRMContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import ClientsPage from './pages/Clients';
import SalesPage from './pages/Sales';
import RemindersPage from './pages/Reminders';
import IntegrationPage from './pages/Integration';

function App() {
  return (
    <CRMProvider>
      <Router>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/clientes" element={<ClientsPage />} />
            <Route path="/ventas" element={<SalesPage />} />
            <Route path="/recordatorios" element={<RemindersPage />} />
            <Route path="/integracion" element={<IntegrationPage />} />
          </Route>
        </Routes>
      </Router>
    </CRMProvider>
  );
}

export default App;
