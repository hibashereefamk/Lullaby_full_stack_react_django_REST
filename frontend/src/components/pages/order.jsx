import { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "./Navbar";
import { Package, Clock, MapPin, ShoppingBag } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "./Order.css";

function Order() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  const token = localStorage.getItem("access_token");
  
  // --- 1. Fetch Orders on Mount ---
  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    
    const fetchOrders = async () => {
      try {
        const config = {
            headers: { Authorization: `Bearer ${token}` }
        };
        // Ensure this URL matches your OrderViewSet path
        const res = await axios.get("http://127.0.0.1:8000/api/orders/", config);
        
        // Handle Django Pagination (if 'results' key exists) or standard list
        const orderData = res.data.results ? res.data.results : res.data;
        setOrders(orderData);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching orders:", err);
        setLoading(false);
      }
    };

    fetchOrders();
  }, [token, navigate]);



  // --- 3. Helper for Status Colors ---
  const getStatusColor = (status) => {
    switch (status) {
      case "Pending": return "#f39c12"; // Orange
      case "Placed": return "#27ae60";  // Green
      case "Shipped": return "#2980b9"; // Blue
      case "Delivered": return "#2c3e50"; // Dark Blue
      case "Cancelled": return "#c0392b"; // Red
      default: return "#95a5a6"; // Gray
    }
  };

  return (
    <div className="page-wrapper">
      <Navbar />
      <div className="profile-container">
        <h1 className="profile-title">My Orders</h1>

        {loading ? (
          <div className="loading-state">Loading your orders...</div>
        ) : orders.length === 0 ? (
          <div className="no-orders">
            <ShoppingBag size={48} />
            <p>You haven't placed any orders yet.</p>
            <button onClick={() => navigate("/products")}>Start Shopping</button>
          </div>
        ) : (
          <div className="orders-list">
            {orders.map((order) => (
              <div key={order.id} className="order-card">
                
                {/* --- Order Header (Always Visible) --- */}
                <div className="order-header" onClick={() => toggleOrderDetails(order.id)}>
                  <div className="order-info-group">
                    <span className="order-number">Order Id #{order.order_number}</span>
                    <span className="order-date">
                      <Clock size={14} /> {new Date(order.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="order-status-group">
                    <span 
                      className="status-badge" 
                      style={{ backgroundColor: getStatusColor(order.status) }}
                    >
                      {order.status}
                    </span>
                    <span className="order-total">₹{order.total_amount}</span>
                  </div>
                </div>

                
                  <div className="order-details">
                    
                    {/* Address Section */}
                    <div className="shipping-info">
                      <strong><MapPin size={16} /> Delivery Address:</strong>
                      <p>{order.address}</p>
                    </div>

                    {/* Items List */}
                    <div className="order-items-table">
                      {order.items.map((item) => (
                        <div key={item.id} className="order-item-row">
                          <img 
                            src={item.product_details?.image} 
                            alt={item.product_name} 
                            onError={(e) => {e.target.src = "https://via.placeholder.com/60"}} // Fallback image
                          />
                          <div className="item-meta">
                            <h4>{item.product_name}</h4>
                            <p>Size: {item.size || "N/A"} | Qty: {item.quantity}</p>
                          </div>
                          <div className="item-price">
                            ₹{item.price}
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="payment-info">
                        Payment Method: <strong>{order.payment_method}</strong>
                    </div>
                  </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Order;