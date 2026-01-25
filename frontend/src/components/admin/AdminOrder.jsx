import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './AdminOrders.css'; // Import the styles

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Helper to get headers with token
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
      // 1. Fetch data from AdminOrderListView
      const response = await axios.get('http://127.0.0.1:8000/api/admin/orders/', {
        headers: getAuthHeaders()
      });
      console.log(setOrders(response.data));
      if (Array.isArray(response.data)) {
        setOrders(response.data);
      } else if (response.data.results && Array.isArray(response.data.results)) {
        // Handle paginated response
        setOrders(response.data.results);
      } else {
        // Fallback to empty array to prevent crash
        setOrders([]); 
        console.error("Unexpected API response format");
      }
      setLoading(false);
    } catch (err) {
      console.error("Fetch error:", err);
      if (err.response?.status === 401) {
        navigate('/login'); // Redirect if token expired
      } else {
        setError("Failed to fetch orders.");
        setLoading(false);
      }
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    // Optimistic UI Update: Update the UI immediately before the server responds
    const originalOrders = [...orders];
    setOrders(orders.map(order => 
      order.id === orderId ? { ...order, status: newStatus } : order
    ));

    try {
      // 2. Send PATCH request to AdminOrderUpdateView
      await axios.patch(`http://127.0.0.1:8000/api/admin/orders/${orderId}/`, 
        { status: newStatus }, 
        { headers: getAuthHeaders() }
      );
      // Optional: Show a success toast notification here
      console.log(`Order ${orderId} updated to ${newStatus}`);

    } catch (err) {
      console.error("Update error:", err);
      // Revert changes if server fails
      setOrders(originalOrders);
      alert("Failed to update status. Check permissions.");
    }
  };

  // Helper to choose badge color
  const getPaymentBadge = (status) => {
    if (status === 'Success') return 'badge badge-success';
    if (status === 'Pending') return 'badge badge-warning';
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
                
                {/* ID & Order Number */}
                <td>
                  <span className="font-bold">#{order.order_number}</span>
                  <br />
                  <span className="text-xs text-gray-500">ID: {order.id}</span>
                </td>

                {/* Date */}
                <td>{order.order_date}</td>

                {/* Customer Name */}
                <td>{order.user || "Guest"}</td>

                {/* Item Count */}
                <td>
                  {order.items ? order.items.length : 0} Items
                </td>

                {/* Total Price */}
                <td className="font-bold">
                  ₹{parseFloat(order.total_amount).toLocaleString()}
                </td>

                {/* Payment Info */}
                <td>
                  <div className="text-sm font-semibold">{order.payment_method}</div>
                  <span className={getPaymentBadge(order.payment_status)}>
                    {order.payment_status}
                  </span>
                </td>

                {/* Order Status & Action */}
                <td>
                  <select 
                    value={order.status} 
                    onChange={(e) => handleStatusChange(order.id, e.target.value)}
                    className="status-select"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Processing">Processing</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
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