import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './AdminOrders.css';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();


  const getAuthHeaders = () => {
    const token = localStorage.getItem("access_token");
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:8000/api/admin/orders/', {
        headers: getAuthHeaders()
      });
      console.log(setOrders(response.data));
      if (Array.isArray(response.data)) {
        setOrders(response.data);
      } else if (response.data.results && Array.isArray(response.data.results)) {
        setOrders(response.data.results);
      } else {
        setOrders([]); 
        console.error("Unexpected API response format");
      }
      setLoading(false);
    } catch (err) {
      console.error("Fetch error:", err);
      if (err.response?.status === 401) {
        navigate('/login');
      } else {
        setError("Failed to fetch orders.");
        setLoading(false);
      }
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    const originalOrders = [...orders];
    setOrders(orders.map(order => 
      order.id === orderId ? { ...order, status: newStatus } : order
    ));

    try {
     
      await axios.patch(`http://127.0.0.1:8000/api/admin/orders/${orderId}/`, 
        { status: newStatus }, 
        { headers: getAuthHeaders() }
      );
     
      console.log(`Order ${orderId} updated to ${newStatus}`);

    } catch (err) {
      console.error("Update error:", err);
      setOrders(originalOrders);
      alert("Failed to update status. Check permissions.");
    }
  };

  const getPaymentBadge = (status) => {
    if (!status) return 'badge-badge-danger';
    

    if (status === 'Success') {
      return 'badge-badge-success';
    }
    if (status=== 'Pending') {
      return 'badge-badge-warning';
    }
    return 'badge badge-danger';
  };
  if (loading) return <div className="orders-container">Loading Orders...</div>;
  if (error) return <div className="orders-container" style={{color: 'red'}}>{error}</div>;

  return (
    <div className="orders-container">
      <h1 className="page-header">Order Management</h1>

      <div className="orders-table-wrapper">
        <table className="orders-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Date</th>
              <th>Customer</th>
              <th>Items</th>
              <th>Total Amount</th>
              <th>Payment</th>
              <th>Order Status (Action)</th>
            </tr>
          </thead>
          <tbody>
            {Array.isArray(orders) && orders.map((order) => (
              <tr key={order.id}>
                
      
                <td>
                  <span className="font-bold">#{order.order_number}</span>
                  <br />
                  <span className="text-xs text-gray-500">ID: {order.id}</span>
                </td>
                <td>{order.order_date}</td>
                <td>{order.user || "Guest"}</td>
                <td>
                  {order.items ? order.items.length : 0} Items
                </td>
                <td className="font-bold">
                  ₹{parseFloat(order.total_amount).toLocaleString()}
                </td>
                <td>
                  <div className="text-sm font-semibold">{order.payment_method}</div>
                  <span className={getPaymentBadge(order.payment_status)}>
                    {order.payment_status || "No Status"} 
                       </span>
                </td>
                <td>
                  <select 
                    value={order.status} 
                    onChange={(e) => handleStatusChange(order.id, e.target.value)}
                    className="status-select"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Placed">Placed</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Canceled">Canceled</option>
                  </select>
                </td>

              </tr>
            ))}

            {orders.length === 0 && (
              <tr>
                <td colSpan="7" style={{textAlign: 'center', padding: '30px'}}>
                  No orders found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminOrders;