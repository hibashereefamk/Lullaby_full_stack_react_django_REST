import React from 'react';
import { NavLink, Outlet,useNavigate} from 'react-router-dom';
import './Sidebar.css';
import { LogOut } from 'lucide-react';

const Sidebar = () => {
  const Navigate=useNavigate()
  const handleLogout=()=>{
    localStorage.clear()
    Navigate('/')
    
  }
  return (
    <>
    <aside className="sidemenu">
      {/* 1. Logo Section */}
      <div className="sidemenu-header">
        <NavLink to="/" className="logo-soft">
          LULLABY
        </NavLink>
        </div>
        <div className="user-avatar">
        <p className="user-role">Store Manager</p>
        </div>
      

      {/* 2. Navigation Menu */}
      <nav className="sidemenu-nav">
        <ul>
          {/* Dashboard (Index) - 'end' ensures it's only active at /admin */}
          <li>
            <NavLink to="/admin" end className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
              <DashboardIcon />
              <span>Dashboard</span>
            </NavLink>
          </li>

          <li>
            <NavLink to="/admin/products" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
              <ProductIcon />
              <span>Products</span>
            </NavLink>
          </li>

          <li>
            <NavLink to="/admin/Orders" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
              <OrderIcon />
              <span>Orders</span>
            </NavLink>
          </li>

          <li>
            <NavLink to="/admin/users" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
              <UserIcon />
              <span>Users</span>
            </NavLink>
          </li>
        </ul>
      </nav>

      {/* 3. User Profile Footer (Like the picture) */}
      <div className="sidemenu-footer">
        
        
           <div className="action-btn logout-btn" onClick={handleLogout}>
          <LogOut size={18}/> <span className="link-text">LOGOUT</span>
        </div>
        </div>
       
      
    </aside>
    <main className="admin-content">
                    <Outlet />
  </main></>
  );
};


const DashboardIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
);
const ProductIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>
);
const UserIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
);
const OrderIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
);

export default Sidebar;