import { useLocation, useNavigate } from "react-router-dom";
import { CheckCircle } from "lucide-react";
import Navbar from "./Navbar";

function OrderSuccess() {
  const location = useLocation();
  const navigate = useNavigate();
  const order = location.state?.order;

  return (
    <div className="page-wrapper">
      <Navbar />
      
      {/* Main Container */}
      <div style={{
        maxWidth: "600px",
        margin: "120px auto 40px", // Top margin clears Navbar
        padding: "40px",
        textAlign: "center",
        backgroundColor: "#fff",
        borderRadius: "12px",
        boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
        border: "1px solid #eee",
        minHeight: "50vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center"
      }}>
        
        {/* Success Icon */}
        <CheckCircle 
          size={80} 
          color="#27ae60" 
          style={{ marginBottom: "20px" }} 
        />

        {/* Heading */}
        <h1 style={{
          fontSize: "2rem",
          fontWeight: "700",
          color: "#333",
          marginBottom: "10px"
        }}>
          Order Placed Successfully!
        </h1>

        {/* Subtext */}
        <p style={{
          color: "#666",
          fontSize: "1.1rem",
          marginBottom: "30px"
        }}>
          Thank you for your purchase. Your order is being processed.
        </p>

        {/* Order Details Box */}
        {order && (
          <div style={{
            background: "#f8f9fa",
            padding: "20px",
            borderRadius: "8px",
            width: "100%",
            marginBottom: "30px",
            border: "1px dashed #ddd"
          }}>
            <p style={{ margin: "5px 0", color: "#555" }}>
              Order ID: <strong style={{ color: "#333" }}>{order.order_number}</strong>
            </p>
            <p style={{ margin: "5px 0", color: "#555" }}>
              Total Amount: <strong style={{ color: "#333" }}>₹{order.total_amount}</strong>
            </p>
          </div>
        )}

        {/* Buttons */}
        <div style={{ display: "flex", gap: "15px", flexWrap: "wrap", justifyContent: "center" }}>
          
          {/* Continue Shopping Button */}
          <button 
            onClick={() => navigate("/products")}
            style={{
              padding: "12px 24px",
              backgroundColor: "#333",
              color: "#fff",
              border: "none",
              borderRadius: "6px",
              fontSize: "1rem",
              fontWeight: "600",
              cursor: "pointer",
              transition: "opacity 0.2s"
            }}
            onMouseOver={(e) => e.target.style.opacity = "0.9"}
            onMouseOut={(e) => e.target.style.opacity = "1"}
          >
            Continue Shopping
          </button>

          {/* View Order Button */}
          <button 
            onClick={() => navigate("/order")}
            style={{
              padding: "12px 24px",
              backgroundColor: "#fff",
              color: "#333",
              border: "1px solid #ccc",
              borderRadius: "6px",
              fontSize: "1rem",
              fontWeight: "600",
              cursor: "pointer",
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = "#f5f5f5"}
            onMouseOut={(e) => e.target.style.backgroundColor = "#fff"}
          >
            View My Orders
          </button>
        </div>

      </div>
    </div>
  );
}

export default OrderSuccess;