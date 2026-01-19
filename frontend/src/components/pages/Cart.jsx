import { useEffect, useState } from "react";
import axios from "axios";
import { Trash2, Plus, Minus } from "lucide-react";
import Navbar from "./Navbar";
import "./Cart.css";

function Cart() {
  const [cartItems, setCartItems] = useState([]);
  const [total, setTotal] = useState(0);
  const token = localStorage.getItem("access_token"); 

  // 2. Config
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  };

  useEffect(() => {
    fetchCart();
  }, []);

  
  useEffect(() => {
    const newTotal = cartItems.reduce(
  (acc, item) => acc + item.subtotal,
  0
);
    setTotal(newTotal);
  }, [cartItems]);

  const fetchCart = () => {
    axios.get("http://127.0.0.1:8000/api/cartitems/", config)
      .then(res => setCartItems(res.data))
      .catch(err => console.error("Error fetching cart", err));
  };

  const updateQuantity = async (id, newQuantity) => {
    if (newQuantity < 1) return;
    try {
      await axios.patch(`http://127.0.0.1:8000/api/cartitems/${id}/`, { quantity: newQuantity }, config);
      setCartItems(prev => prev.map(item => 
        item.id === id ? { ...item, quantity: newQuantity } : item
      ));
      fetchCart();
    } catch (err) {
      console.error("Error updating quantity", err);
    }
  };

  const removeItem = async (id) => {
    try {
      await axios.delete(`http://127.0.0.1:8000/api/cartitems/${id}/`, config);
      setCartItems(prev => prev.filter(item => item.id !== id));
    } catch (err) {
      console.error("Error removing item", err);
    }
  };

  const handleCheckout = () => {
    alert("Proceeding to checkout...");
    // Redirect to checkout page or trigger API
  };

  return (
    <div className="page-wrapper">
      <Navbar />
      <div className="cart-container">
        <h2>Shopping Cart ({cartItems.length} items)</h2>

        <div className="cart-layout">
          {/* Cart Items List */}
          <div className="cart-items">
            {cartItems.map(item =>{ const hasDiscount =
    item.product_details.discount_price !== null && item.product_details.discount_price > 0;

  const displayPrice = hasDiscount
    ? item.product_details.discount_price
    : item.product_details.price;

  return(
              
              <div key={item.id} className="cart-item">
                <img src={item.product_details.image} alt={item.product_details.name} />
                <div className="cart-info">
                  <h3>{item.product_details.name}</h3>
                  <p className="cart-price">₹{displayPrice}</p>
                  <p className="item-total">Total: ₹{item.subtotal}</p>

                </div>
                
                <div className="quantity-controls">
                  <button onClick={() => updateQuantity(item.id, item.quantity - 1)}><Minus size={16} /></button>
                  <span>{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.id, item.quantity + 1)}><Plus size={16} /></button>
                </div>

                <button className="remove-btn" onClick={() => removeItem(item.id)}>
                  <Trash2 size={20} />
                </button>
              </div>
            )})}
          </div>

          {/* Checkout Summary */}
          {cartItems.length > 0 && (
            <div className="cart-summary">
              <h3>Order Summary</h3>
              <div className="summary-row">
                <span>Subtotal</span>
                <span>₹{total.toFixed(2)}</span>
              </div>
              <div className="summary-row">
                <span>Shipping</span>
                <span>Free</span>
              </div>
              <div className="summary-total">
                <span>Total</span>
                <span>₹{total.toFixed(2)}</span>
              </div>
              <button className="checkout-btn" onClick={handleCheckout}>Checkout</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Cart;