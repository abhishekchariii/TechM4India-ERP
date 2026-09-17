import {
  LayoutDashboard,
  Users,
  Building2,
  CalendarCheck,
  Package,
  Boxes,
  ShoppingCart,
  Truck,
  FileText,
  Receipt,
  UserPlus,
  School,
  GraduationCap,
  FolderKanban,
  Wallet,
  FileArchive,
  Bell,
  Globe,
  BarChart3,
  ShieldCheck,
  LogOut,
} from 'lucide-react';

import { NavLink, useNavigate } from 'react-router-dom';

import './Sidebar.css';

function Sidebar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <h2>TechM4India ERP</h2>
      </div>

      {/* Navigation */}
      <nav className="sidebar-menu">

        {/* Dashboard */}
        <NavLink to="/dashboard" className="menu-item">
          <LayoutDashboard size={20} />
          <span>Dashboard</span>
        </NavLink>

        {/* ================= COMPANY & HR ================= */}

        <NavLink to="/organization" className="menu-item">
          <Building2 size={20} />
          <span>Organization</span>
        </NavLink>

        <NavLink to="/divisions" className="menu-item">
          <Building2 size={20} />
          <span>Divisions</span>
        </NavLink>

        <NavLink to="/employees" className="menu-item">
          <Users size={20} />
          <span>Employees</span>
        </NavLink>

        <NavLink to="/departments" className="menu-item">
          <Building2 size={20} />
          <span>Departments</span>
        </NavLink>

        <NavLink to="/branches" className="menu-item">
          <Building2 size={20} />
          <span>Branches</span>
        </NavLink>

        <NavLink to="/attendance" className="menu-item">
          <CalendarCheck size={20} />
          <span>Attendance</span>
        </NavLink>

        {/* Leave Management */}
        <NavLink to="/leave" className="menu-item">
          <CalendarCheck size={20} />
          <span>Leave Management</span>
        </NavLink>

        {/* ================= CRM ================= */}

        <NavLink to="/customers" className="menu-item">
          <Users size={20} />
          <span>Customers</span>
        </NavLink>

        <NavLink to="/leads" className="menu-item">
          <UserPlus size={20} />
          <span>Leads</span>
        </NavLink>

        <NavLink to="/institutions" className="menu-item">
          <School size={20} />
          <span>Institutions</span>
        </NavLink>

        {/* ================= PROGRAMS & PROJECTS ================= */}

        <NavLink to="/programs" className="menu-item">
          <GraduationCap size={20} />
          <span>Programs</span>
        </NavLink>

        <NavLink to="/projects" className="menu-item">
          <FolderKanban size={20} />
          <span>Projects</span>
        </NavLink>

        {/* ================= INVENTORY & ASSETS ================= */}

        <NavLink to="/inventory" className="menu-item">
          <Package size={20} />
          <span>Inventory</span>
        </NavLink>

        <NavLink to="/assets" className="menu-item">
          <Boxes size={20} />
          <span>Assets</span>
        </NavLink>

        <NavLink to="/suppliers" className="menu-item">
          <Truck size={20} />
          <span>Suppliers</span>
        </NavLink>

        {/* ================= SALES & FINANCE ================= */}

        <NavLink to="/sales-orders" className="menu-item">
          <ShoppingCart size={20} />
          <span>Sales Orders</span>
        </NavLink>

        <NavLink to="/purchase-orders" className="menu-item">
          <Truck size={20} />
          <span>Purchase Orders</span>
        </NavLink>

        <NavLink to="/invoices" className="menu-item">
          <FileText size={20} />
          <span>Invoices</span>
        </NavLink>

        <NavLink to="/expenses" className="menu-item">
          <Wallet size={20} />
          <span>Expenses</span>
        </NavLink>

        <NavLink to="/payroll" className="menu-item">
          <Receipt size={20} />
          <span>Payroll</span>
        </NavLink>

        {/* ================= DOCUMENTS & NOTIFICATIONS ================= */}

        <NavLink to="/documents" className="menu-item">
          <FileArchive size={20} />
          <span>Documents</span>
        </NavLink>

        <NavLink to="/notifications" className="menu-item">
          <Bell size={20} />
          <span>Notifications</span>
        </NavLink>

        {/* ================= WEBSITE CMS ================= */}

        <NavLink to="/cms" className="menu-item">
          <Globe size={20} />
          <span>Website CMS</span>
        </NavLink>

        {/* ================= REPORTS ================= */}

        <NavLink to="/reports" className="menu-item">
          <BarChart3 size={20} />
          <span>Reports</span>
        </NavLink>

        {/* ================= ADMINISTRATION ================= */}

        <NavLink to="/users" className="menu-item">
          <ShieldCheck size={20} />
          <span>Users & Roles</span>
        </NavLink>

      </nav>

      {/* Logout */}
      <button
        type="button"
        className="logout-button"
        onClick={handleLogout}
      >
        <LogOut size={20} />
        <span>Logout</span>
      </button>
    </div>
  );
}

export default Sidebar;