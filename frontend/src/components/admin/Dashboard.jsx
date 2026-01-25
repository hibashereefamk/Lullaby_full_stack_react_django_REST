import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom'; // Assuming you use react-router
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { DollarSign, ShoppingBag, Users, Package, TrendingUp } from 'lucide-react';
import './Dashboard.css'


const Dashboard = () => {
  const navigate = useNavigate();
const [stats, setStats] = useState({
    total_income: 0,
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
    } if (role !== 'admin' && role !== 'superuser') {
        alert("Access Denied: You are not an admin.");
        navigate('/');
        return;
    }const fetchStats = async () => {
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
            localStorage.removeItem('access_Token');
            localStorage.removeItem('refresh_token');
            localStorage.removeItem('role');
            navigate('/login');
        } 
        else {
            setError("Failed to load dashboard data.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [navigate]);
  if (loading) return <div className="dashboard-container">Loading Stats...</div>;
  if (error) return <div className="dashboard-container" style={{color: 'red'}}>{error}</div>;


  return (
    <div className="dashboard-container">
      <h1 className="dashboard-header">Admin Dashboard</h1>
      
     <div className="stats-grid">
        
        {/* Total Income */}
        <div className="stat-card card-green">
          <div className="card-title">Total Income</div>
          <div className="card-value">${stats.total_income.toLocaleString()}</div>
        </div>
        <div className="stat-card card-green">
          <div className="card-title">Total Sucess Payment</div>
          <div className="card-value">${stats.total_payment_success.toLocaleString()}</div>
        </div>
        <div className="stat-card card-green">
          <div className="card-title">Total Pending Payment</div>
          <div className="card-value">${stats.total_payment_pending.toLocaleString()}</div>
        </div>
    </div>
    <div className="stats-grid">
        <Link to="/admin/products" className="stat-card card-blue">
          <div className="card-title">Total Products</div>
          <div className="card-value">{stats.total_products}</div>
          <span className="card-link" style={{color: '#3b82f6'}}>View Details &rarr;</span>
        </Link>

        <Link to="/admin/users" className="stat-card card-orange">
          <div className="card-title">Total Users</div>
          <div className="card-value">{stats.total_users}</div>
          <span className="card-link" style={{color: '#f97316'}}>Manage Users &rarr;</span>
        </Link>

        <Link to="/admin/orders" className="stat-card card-purple">
          <div className="card-title">Total Orders</div>
          <div className="card-value">{stats.total_orders}</div>
          <span className="card-link" style={{color: '#a855f7'}}>Manage Orders &rarr;</span>
        </Link>
      </div>
      <div className="details-grid">
        <div className="details-panel">
          <h3 className="panel-title">Order Status</h3>
          <div className="status-container">
            {stats.order_status_breakdown.map((item, index) => (
              <div key={index} className="status-box">
                <p className="status-label">{item.status}</p>
                <p className="status-count">{item.count}</p>
              </div>
            ))}
            {stats.order_status_breakdown.length === 0 && <p>No orders yet.</p>}
          </div>
        </div>
      </div>



    </div>
  );
};

export default Dashboard;