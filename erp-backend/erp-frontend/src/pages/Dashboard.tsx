import { useEffect, useState } from 'react';
import {
  Users,
  Package,
  ShoppingCart,
  FileText,
  AlertTriangle,
  IndianRupee,
} from 'lucide-react';

import api from '../services/api';
import './Dashboard.css';

interface DashboardData {
  employees: {
    total: number;
  };
  inventory: {
    totalItems: number;
    lowStockItems: number;
  };
  purchaseOrders: {
    total: number;
    totalAmount: number;
  };
  sales: {
    totalOrders: number;
    totalRevenue: number;
  };
  invoices: {
    total: number;
    pending: number;
    partiallyPaid: number;
    paid: number;
  };
}

function Dashboard() {
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const response = await api.get('/dashboard');
        setDashboard(response.data);
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  if (loading) {
    return (
      <div>
        <h1>Dashboard</h1>
        <p className="dashboard-subtitle">Loading dashboard...</p>
      </div>
    );
  }

  if (!dashboard) {
    return (
      <div>
        <h1>Dashboard</h1>
        <p className="dashboard-subtitle">
          Unable to load dashboard data.
        </p>
      </div>
    );
  }

  return (
    <div>
      <h1>Dashboard</h1>

      <p className="dashboard-subtitle">
        Welcome to your ERP Management System
      </p>

      <div className="dashboard-cards">

        <div className="dashboard-card">
          <Users size={32} />
          <div>
            <p>Total Employees</p>
            <h2>{dashboard.employees.total}</h2>
          </div>
        </div>

        <div className="dashboard-card">
          <Package size={32} />
          <div>
            <p>Inventory Items</p>
            <h2>{dashboard.inventory.totalItems}</h2>
          </div>
        </div>

        <div className="dashboard-card">
          <ShoppingCart size={32} />
          <div>
            <p>Sales Orders</p>
            <h2>{dashboard.sales.totalOrders}</h2>
          </div>
        </div>

        <div className="dashboard-card">
          <FileText size={32} />
          <div>
            <p>Total Invoices</p>
            <h2>{dashboard.invoices.total}</h2>
          </div>
        </div>

        <div className="dashboard-card">
          <AlertTriangle size={32} />
          <div>
            <p>Low Stock Items</p>
            <h2>{dashboard.inventory.lowStockItems}</h2>
          </div>
        </div>

        <div className="dashboard-card">
          <IndianRupee size={32} />
          <div>
            <p>Total Revenue</p>
            <h2>
              ₹{dashboard.sales.totalRevenue.toLocaleString('en-IN')}
            </h2>
          </div>
        </div>

      </div>

      <div className="dashboard-section">
        <h2>Purchase Orders</h2>

        <div className="dashboard-summary">
          <div>
            <span>Total Orders</span>
            <strong>{dashboard.purchaseOrders.total}</strong>
          </div>

          <div>
            <span>Total Amount</span>
            <strong>
              ₹{dashboard.purchaseOrders.totalAmount.toLocaleString('en-IN')}
            </strong>
          </div>
        </div>
      </div>

      <div className="dashboard-section">
        <h2>Invoice Status</h2>

        <div className="dashboard-summary">
          <div>
            <span>Pending</span>
            <strong>{dashboard.invoices.pending}</strong>
          </div>

          <div>
            <span>Partially Paid</span>
            <strong>{dashboard.invoices.partiallyPaid}</strong>
          </div>

          <div>
            <span>Paid</span>
            <strong>{dashboard.invoices.paid}</strong>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;