import { Routes, Route, Navigate } from 'react-router-dom';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Employees from './pages/Employees';
import Departments from './pages/Departments';
import Layout from './layouts/Layout';
import Attendance from './pages/Attendance';
import Customers from './pages/Customers';
import Leads from './pages/Leads';
import LeadDetails from './pages/LeadDetails';
import Institutions from './pages/Institutions';
import Programs from './pages/Programs';
import Projects from './pages/Projects';
import Inventory from './pages/Inventory';
import Assets from './pages/Assets';
import Suppliers from './pages/Suppliers';
import SalesOrders from './pages/SalesOrders';
import PurchaseOrders from './pages/PurchaseOrders';
import Invoices from './pages/Invoices';
import Expenses from './pages/Expenses';
import Payroll from './pages/Payroll';
import Documents from './pages/Documents';
import Notifications from './pages/Notifications';
import CMS from './pages/CMS';
import Reports from './pages/Reports';
import Users from './pages/Users';
import Branches from './pages/Branches';
import Organization from './pages/Organization';
import Divisions from './pages/Divisions';
import Leave from './pages/Leave';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem('token');

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function App() {
  const token = localStorage.getItem('token');

  return (
    <Routes>

      {/* Login page */}
      <Route
        path="/login"
        element={
          token
            ? <Navigate to="/dashboard" replace />
            : <Login />
        }
      />

      {/* Protected ERP pages */}
      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >

        <Route path="/dashboard" element={<Dashboard />} />

        <Route path="/employees" element={<Employees />} />

        <Route path="/departments" element={<Departments />} />

        <Route path="/attendance" element={<Attendance />} />

        <Route path="/leave" element={<Leave />} />

        <Route path="/customers" element={<Customers />} />

        <Route path="/leads" element={<Leads />} />

        <Route path="/leads/:id" element={<LeadDetails />} />

        <Route path="/institutions" element={<Institutions />} />

        <Route path="/programs" element={<Programs />} />

        <Route path="/projects" element={<Projects />} />

        <Route path="/inventory" element={<Inventory />} />

        <Route path="/assets" element={<Assets />} />

        <Route path="/suppliers" element={<Suppliers />} />

        <Route path="/sales-orders" element={<SalesOrders />} />

        <Route path="/purchase-orders" element={<PurchaseOrders />} />

        <Route path="/invoices" element={<Invoices />} />

        <Route path="/expenses" element={<Expenses />} />

        <Route path="/payroll" element={<Payroll />} />

        <Route path="/documents" element={<Documents />} />

        <Route path="/notifications" element={<Notifications />} />

        <Route path="/cms" element={<CMS />} />

        <Route path="/reports" element={<Reports />} />

        <Route path="/users" element={<Users />} />

        <Route path="/branches" element={<Branches />} />

        <Route path="/organization" element={<Organization />} />

        <Route path="/divisions" element={<Divisions />} />

      </Route>

      {/* Root → Login */}
      <Route
        path="/"
        element={<Navigate to="/login" replace />}
      />

      {/* Unknown routes → Login */}
      <Route
        path="*"
        element={<Navigate to="/login" replace />}
      />

    </Routes>
  );
}

export default App;