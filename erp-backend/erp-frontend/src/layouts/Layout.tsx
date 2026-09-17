import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import './layout.css';

function Layout() {
  return (
    <div className="app-layout">
      <Sidebar />

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;