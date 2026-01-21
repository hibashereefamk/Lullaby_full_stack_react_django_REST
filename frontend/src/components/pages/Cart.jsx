import { useEffect, useState } from "react";
import axios from "axios";
import { Trash2, Plus, Minus, AlertCircle } from "lucide-react"; // Added AlertCircle for warning
import Navbar from "./Navbar";
import "./Cart.css";
import { useNavigate } from "react-router-dom";

function Cart() {
  const [cartItems, setCartItems] = useState([]);
  const [total, setTotal] = useState(0);
  const token = localStorage.getItem("access_token");
  const navigate = useNavigate()
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

  // --- NEW: Logic to Update Size ---
  const updateSize = async (id, newSize) => {
    try {
      await axios.patch(
        `http://127.0.0.1:8000/api/cartitems/${id}/`, 
        { size: newSize }, 
        config
      );
      
      fetchCart(); 
    } catch (err) {
      console.error("Error updating size", err);
      alert("Could not update size. It might be out of stock.");
    }
  };

  const updateQuantity = async (id, newQuantity) => {
    if (newQuantity < 1) return;
    try {
      await axios.patch(`http://127.0.0.1:8000/api/cartitems/${id}/`, { quantity: newQuantity }, config);
      setCartItems(prev => prev.map(item =>
        item.id === id ? { ...item, quantity: newQuantity } : item
      ));
      fetchCart(); // Fetch to ensure subtotals match backend
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
// In Cart.jsx

const handleCheckout = async () => {
    const missingSizes = cartItems.some(item => {
        const hasVariants = item.product_details.sizes && item.product_details.sizes.length > 0;
        const noSizeSelected = !item.size && (!item.variant || !item.variant.size);
        return hasVariants && noSizeSelected;
    });

    if (missingSizes) {
        alert("Please select a size for all items before checking out.");
        return;
    }

    
    try {
        // Note: We use /api/cart/ here, not /api/cartitems/
        // This hits CartViewSet, which uses CartSerializer to return 'total_price'
        const response = await axios.get("http://127.0.0.1:8000/api/cart/", config);
        
        // Since ViewSet returns a list, we take the first cart
        const cartData = Array.isArray(response.data) ? response.data[0] : response.data;

        if (!cartData || !cartData.items || cartData.items.length === 0) {
            alert("Your cart is empty or invalid.");
            return;
        }

        // 3. Redirect with Data
        // We pass 'cartData' in the navigation state
        navigate("/checkout", { state: { cart: cartData } });

    } catch (err) {
        console.error("Checkout Error:", err);
        alert("Could not initiate checkout. Please try again.");
    }
};
  

  return (
    <div className="page-wrapper">
      <Navbar />
      <div className="cart-container">
        <h2>Shopping Cart ({cartItems.length} items)</h2>

        <div className="cart-layout">
          <div className="cart-items">
            {cartItems.map(item => {
              const hasDiscount = item.product_details.discount_price !== null && item.product_details.discount_price > 0;
              const displayPrice = hasDiscount ? item.product_details.discount_price : item.product_details.price;
              
              // Helper to safely get the current size (Modify 'item.size' based on your serializer structure)
              // If your serializer returns nested variant, use item.variant?.size
              const currentSize = item.size || (item.variant ? item.variant.size : ""); 
              
              // Helper to get available sizes. 
              // ASSUMPTION: Your product_details serializer includes a list like ["S", "M", "L"]
              const availableSizes = item.product_details.sizes || []; 

              return (
                <div key={item.id} className="cart-item">
                  <img src={item.product_details.image} alt={item.product_details.name} />
                  
                  <div className="cart-info">
                    <h3>{item.product_details.name}</h3>
                    
                    {/* --- NEW: Size Dropdown --- */}
                    <div className="size-selector">
                      <label>Size: </label>
                      <select 
                        value={currentSize} 
                        onChange={(e) => updateSize(item.id, e.target.value)}
                        className={!currentSize ? "select-warning" : ""}
                      >
                        <option value="" disabled>Select Size</option>
                        {availableSizes.length > 0 ? (
                            availableSizes.map(size => (
                                <option key={size} value={size}>{size}</option>
                            ))
                        ) : (
                            <option disabled>No sizes</option>
                        )}
                      </select>
                      
                      {/* Warning if no size selected */}
                      {!currentSize && (
                        <span className="size-warning">
                          <AlertCircle size={14} /> Required
                        </span>
                      )}
                    </div>

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
              );
            })}
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