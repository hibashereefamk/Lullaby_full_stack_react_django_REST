import { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "./Navbar";
import { useLocation, useNavigate } from "react-router-dom";
import { MapPin, CreditCard, Plus, CheckCircle, ShoppingBag } from "lucide-react";
import "./checkoutpage.css"


function Checkout() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [cart, setCart] = useState(null); 
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [loading, setLoading] = useState(true);
  
  // Address Form State
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [newAddress, setNewAddress] = useState({
    street: "", city: "", state: "", postal_code: "", country: "", is_default: false
  });

  const token = localStorage.getItem("access_token");
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  };

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    const initCheckout = async () => {
      try {
        // --- 1. Fetch Addresses ---
        const addressRes = await axios.get("http://127.0.0.1:8000/api/addresses/", config);
        // Handle Pagination: check if data has 'results' key or is the array itself
        const addressList = addressRes.data.results || addressRes.data; 
        setAddresses(addressList);
        
        // Auto-select default address
        if (addressList.length > 0) {
            const defaultAddr = addressList.find(a => a.is_default);
            setSelectedAddressId(defaultAddr ? defaultAddr.id : addressList[0].id);
        }

        // --- 2. Handle Cart Data ---
        if (location.state && location.state.cart) {
            // Case A: Data passed from navigation
            setCart(location.state.cart);
        } else {
            // Case B: Fetch from API (User refreshed page)
            const cartRes = await axios.get("http://127.0.0.1:8000/api/cart/", config);
            
            // FIX: Handle Pagination ({ count: 1, results: [...] }) vs List ([...])
            const results = cartRes.data.results || cartRes.data;
            
            // The cart is usually the first item in the list for the user
            const userCart = Array.isArray(results) ? results[0] : results;
            
            setCart(userCart);
        }
        setLoading(false);

      } catch (err) {
        console.error("Error loading checkout data:", err);
        setLoading(false);
      }
    };

    initCheckout();
  }, [token, navigate, location.state]);

  const handleAddressSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if(!newAddress.street || !newAddress.city || !newAddress.postal_code) {
        alert("Please fill in all required address fields");
        return;
    }

    try {
      const res = await axios.post("http://127.0.0.1:8000/api/addresses/", newAddress, config);
      
      // Add the new address to the list and select it
      setAddresses([...addresses, res.data]);
      setSelectedAddressId(res.data.id);
      
      // Reset and hide form
      setShowAddressForm(false);
      setNewAddress({ street: "", city: "", state: "", postal_code: "", country: "", is_default: false });
      
    } catch (err) {
      // FIX: Better Error Alerting
      console.error("Address Error:", err.response);
      if (err.response && err.response.data) {
          // Alert the specific error from Django (e.g., "This field is required")
          alert("Error: " + JSON.stringify(err.response.data));
      } else {
          alert("Failed to save address. Please try again.");
      }
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddressId) {
      alert("Please select a delivery address.");
      return;
    }

    try {
      const orderData = {
        address_id: selectedAddressId,
        payment_method: paymentMethod,
      };

      const res = await axios.post("http://127.0.0.1:8000/api/orders/", orderData, config);
      
      if (res.status === 201 || res.status === 200) {
        alert("Order Placed Successfully! Order ID: " + res.data.order_number);
        navigate("/order-success"); 
      }
    } catch (err) {
      console.error("Order Error:", err.response?.data);
      // Alert specific backend errors (e.g., "Cart is empty")
      alert(err.response?.data?.detail || JSON.stringify(err.response?.data) || "Failed to place order.");
    }
  };

  if (loading) return <div className="checkout-loading">Loading Checkout...</div>;

  return (
    <div className="page-wrapper">
      <Navbar />
      <div className="checkout-container">
        <h1 className="checkout-title">Checkout</h1>

        <div className="checkout-layout">
          
          {/* --- LEFT: Address & Payment --- */}
          <div className="checkout-left">
            {/* Address Section */}
            <section className="checkout-section">
              <div className="section-header">
                <MapPin size={20} />
                <h2>Delivery Address</h2>
              </div>
              
              {addresses.length === 0 && !showAddressForm && (
                  <p className="no-address-msg">No addresses found. Please add one.</p>
              )}

              <div className="address-list">
                {addresses.map((addr) => (
                  <div 
                    key={addr.id} 
                    className={`address-card ${selectedAddressId === addr.id ? "selected" : ""}`}
                    onClick={() => setSelectedAddressId(addr.id)}
                  >
                    <div className="address-radio">
                        {selectedAddressId === addr.id && <div className="radio-dot"></div>}
                    </div>
                    <div className="address-info">
                      <p><strong>{addr.street}</strong></p>
                      <p>{addr.city}, {addr.state} - {addr.postal_code}</p>
                      <p>{addr.country}</p>
                    </div>
                  </div>
                ))}
              </div>

              {!showAddressForm ? (
                <button className="add-address-btn" onClick={() => setShowAddressForm(true)}>
                  <Plus size={16} /> Add New Address
                </button>
              ) : (
                <form className="new-address-form" onSubmit={handleAddressSubmit}>
                    <h3>New Address</h3>
                    <input type="text" placeholder="Street Address *" required value={newAddress.street} onChange={e => setNewAddress({...newAddress, street: e.target.value})} />
                    <div className="form-row">
                        <input type="text" placeholder="City *" required value={newAddress.city} onChange={e => setNewAddress({...newAddress, city: e.target.value})} />
                        <input type="text" placeholder="State *" required value={newAddress.state} onChange={e => setNewAddress({...newAddress, state: e.target.value})} />
                    </div>
                    <div className="form-row">
                        <input type="text" placeholder="Postal Code *" required value={newAddress.postal_code} onChange={e => setNewAddress({...newAddress, postal_code: e.target.value})} />
                        <input type="text" placeholder="Country *" required value={newAddress.country} onChange={e => setNewAddress({...newAddress, country: e.target.value})} />
                    </div>
                    <div className="form-actions">
                        <button type="submit" className="save-btn">Save Address</button>
                        <button type="button" className="cancel-btn" onClick={() => setShowAddressForm(false)}>Cancel</button>
                    </div>
                </form>
              )}
            </section>

            {/* Payment Section */}
            <section className="checkout-section">
              <div className="section-header">
                <CreditCard size={20} />
                <h2>Payment Method</h2>
              </div>
              <div className="payment-options">
                <label className={`payment-option ${paymentMethod === 'COD' ? 'active' : ''}`}>
                    <input type="radio" name="payment" value="COD" checked={paymentMethod === 'COD'} onChange={(e) => setPaymentMethod(e.target.value)} />
                    <span>Cash on Delivery (COD)</span>
                </label>
                <label className={`payment-option ${paymentMethod === 'Online' ? 'active' : ''}`}>
                    <input type="radio" name="payment" value="Online" checked={paymentMethod === 'Online'} onChange={(e) => setPaymentMethod(e.target.value)} />
                    <span>Online Payment (Razorpay/Stripe)</span>
                </label>
              </div>
            </section>
          </div>

          {/* --- RIGHT: Order Summary --- */}
          <div className="checkout-right">
            <div className="order-summary-card">
              <h3>Order Summary</h3>
              
              <div className="summary-items">
                {cart && cart.items && cart.items.length > 0 ? (
                    cart.items.map((item) => (
                    <div key={item.id} className="summary-item">
                        {/* Safe check for image */}
                        {item.product_details?.image && (
                            <img src={item.product_details.image} alt={item.product_details.name} />
                        )}
                        <div className="item-info">
                            <h4>{item.product_details?.name || "Product Name"}</h4>
                            <p className="item-variant">
                                Size: {item.size || "Standard"} | Qty: {item.quantity}
                            </p>
                            <p className="item-price">₹{item.subtotal}</p>
                        </div>
                    </div>
                    ))
                ) : (
                    <p className="empty-summary">No items in summary.</p>
                )}
              </div>

              <div className="summary-divider"></div>

              <div className="summary-totals">
                <div className="total-row">
                    <span>Subtotal</span>
                    <span>₹{cart?.total_price || 0}</span>
                </div>
                <div className="total-row">
                    <span>Shipping</span>
                    <span>Free</span>
                </div>
                <div className="total-row grand-total">
                    <span>Total</span>
                    <span>₹{cart?.total_price || 0}</span>
                </div>
              </div>

              <button 
                className="place-order-btn" 
                onClick={handlePlaceOrder}
                disabled={!cart || !cart.items || cart.items.length === 0}
              >
                Place Order <CheckCircle size={18} />
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default Checkout;






























