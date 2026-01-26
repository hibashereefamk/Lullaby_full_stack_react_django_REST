import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  DollarSign, 
  ShoppingBag, 
  Users, 
  Package, 
  CheckCircle, 
  Clock, 
  ArrowRight,
  Activity
} from 'lucide-react';
import './Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();
  
  // Initialize all fields to avoid "undefined" errors before API loads
  const [stats, setStats] = useState({
    total_income: 0,
    total_payment_success: 0,
    total_payment_pending: 0,
    total_products: 0,
    total_users: 0,
    total_orders: 0,
    order_status_breakdown: []
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    const role = localStorage.getItem("role");

    if (!token) {
      navigate('/login');
      return;
    }
    
    // Strict role check
    if (role !== 'admin' && role !== 'superuser') {
      alert("Access Denied: You are not an admin.");
      navigate('/');
      return;
    }

    const fetchStats = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:8000/api/admin/dashboard-stats/', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        setStats(response.data);
      } catch (err) {
        console.error("Dashboard Error:", err);
        if (err.response && err.response.status === 401) {
          localStorage.clear(); // Clear all auth data
          navigate('/login');
        } else {
          setError("Failed to load dashboard data. Please check your connection.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [navigate]);

  if (loading) return (
    <div className="dashboard-loading">
      <div className="spinner"></div>
      <p>Loading Dashboard...</p>
    </div>
  );

  if (error) return (
    <div className="dashboard-error">
      <p>{error}</p>
      <button className="btn-retry" onClick={() => window.location.reload()}>Retry</button>
    </div>
  );

  return (
    <div className='root'>
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div>
          <h1>Overview</h1>
          <p className="subtitle">Welcome back, Admin. Here is what's happening today.</p>
        </div>
        <div className="date-badge">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </header>
      
      {/* Section 1: Financial Overview */}
      <section className="dashboard-section">
        <h2 className="section-title">Financial Performance</h2>
        <div className="stats-grid financial-grid">
          
          <div className="stat-card income-card">
            <div className="icon-wrapper bg-green">
              <DollarSign size={24} color="#10b981" />
            </div>
            <div className="stat-content">
              <span className="stat-label">Total Income</span>
              <span className="stat-value">${stats.total_income?.toLocaleString() || 0}</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="icon-wrapper bg-blue">
              <CheckCircle size={24} color="#3b82f6" />
            </div>
            <div className="stat-content">
              <span className="stat-label">Successful Payments</span>
              <span className="stat-value">${stats.total_payment_success?.toLocaleString() || 0}</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="icon-wrapper bg-orange">
              <Clock size={24} color="#f59e0b" />
            </div>
            <div className="stat-content">
              <span className="stat-label">Pending Payments</span>
              <span className="stat-value">${stats.total_payment_pending?.toLocaleString() || 0}</span>
            </div>
          </div>

        </div>
      </section>

      {/* Section 2: Quick Actions / Entity Overview */}
      <section className="dashboard-section">
        <h2 className="section-title">Store Management</h2>
        <div className="stats-grid management-grid">
          
          <Link to="/admin/products" className="manage-card">
            <div className="manage-header">
              <div className="icon-wrapper bg-indigo">
                <Package size={24} color="#6366f1" />
              </div>
              <ArrowRight size={20} className="arrow-icon" />
            </div>
            <div className="manage-content">
              <h3>{stats.total_products}</h3>
              <p>Total Products</p>
            </div>
          </Link>

          <Link to="/admin/users" className="manage-card">
            <div className="manage-header">
              <div className="icon-wrapper bg-purple">
                <Users size={24} color="#8b5cf6" />
              </div>
              <ArrowRight size={20} className="arrow-icon" />
            </div>
            <div className="manage-content">
              <h3>{stats.total_users}</h3>
              <p>Registered Users</p>
            </div>
          </Link>

          <Link to="/admin/orders" className="manage-card">
            <div className="manage-header">
              <div className="icon-wrapper bg-pink">
                <ShoppingBag size={24} color="#ec4899" />
              </div>
              <ArrowRight size={20} className="arrow-icon" />
            </div>
            <div className="manage-content">
              <h3>{stats.total_orders}</h3>
              <p>Total Orders</p>
            </div>
          </Link>

        </div>
      </section>

      {/* Section 3: Order Status Breakdown */}
      <section className="dashboard-section">
        <div className="details-panel">
          <div className="panel-header">
            <Activity size={20} />
            <h3>Order Status Distribution</h3>
          </div>
          
          <div className="status-grid">
            {stats.order_status_breakdown && stats.order_status_breakdown.length > 0 ? (
              stats.order_status_breakdown.map((item, index) => (
                <div key={index} className="status-item">
                  <div className="status-info">
                    <span className="status-name">{item.status}</span>
                    <span className="status-qty">{item.count} orders</span>
                  </div>
                  {/* Simple CSS-based progress bar visualization */}
                  <div className="progress-bg">
                    <div 
                      className="progress-fill" 
                      style={{ 
                        width: `${(item.count / stats.total_orders) * 100}%`,
                        backgroundColor: getColorForStatus(item.status)
                      }}
                    ></div>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state">No order data available yet.</div>
            )}
          </div>
        </div>
      </section>
        </div>
    </div>
  );
};

// Helper function for progress bar colors
const getColorForStatus = (status) => {
  switch(status?.toLowerCase()) {
    case 'pending': return '#f59e0b';
    case 'completed': return '#10b981';
    case 'cancelled': return '#ef4444';
    case 'shipped': return '#3b82f6';
    default: return '#6b7280';
  }
};

export default Dashboard;