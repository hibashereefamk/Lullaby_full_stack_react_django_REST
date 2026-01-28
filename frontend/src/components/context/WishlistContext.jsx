import { createContext, useContext, useState, useEffect, useCallback } from "react";
import axios from "axios";

const ShopContext = createContext();

export const ShopProvider = ({ children }) => {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [cartTotal, setCartTotal] = useState(0);

  const token = localStorage.getItem("access_token");
  const config = { headers: { Authorization: `Bearer ${token}` } };

  // --- 1. FETCH FUNCTIONS ---
  
  // We use useCallback to ensure these functions are stable references
  const fetchCart = useCallback(() => {
    if (!token) {
        setCartItems([]);
        return;
    }
    axios.get("http://127.0.0.1:8000/api/cart/", config)
      .then(res => {
        const carts = res.data.results ? res.data.results : res.data;
        if (Array.isArray(carts) && carts.length > 0) {
           setCartItems(carts[0].items || []); 
           setCartTotal(carts[0].total_price || 0);
        } else {
           setCartItems([]);
           setCartTotal(0);
        }
      })
      .catch(err => console.error("Error loading cart", err));
  }, [token]);

  const fetchWishlist = useCallback(() => {
    if (!token) {
        setWishlistItems([]);
        return;
    }
    axios.get("http://127.0.0.1:8000/api/wishlist/", config)
      .then(res => {
        const items = res.data.results ? res.data.results : res.data;
        setWishlistItems(items || []);
      })
      .catch(err => console.error("Error loading wishlist", err));
  }, [token]);

  // --- 2. INITIAL LOAD (Fixes Reload Issue) ---
  useEffect(() => {
    if (token) {
      fetchCart();
      fetchWishlist();
    } else {
      setCartItems([]);
      setWishlistItems([]);
      setCartTotal(0);
    }
  }, [token, fetchCart, fetchWishlist]); 


  // --- 3. TOGGLE WISHLIST (Fixed Logic) ---
  const toggleWishlist = async (product) => {
    if (!token) { alert("Please login first."); return; }
    
    // FIX: Check item.product.id (Backend structure), not item.productId
    const existingItem = wishlistItems.find(item => item.product.id === product.id);

    try {
      if (existingItem) {
        // Optimistic Remove
        setWishlistItems(prev => prev.filter(item => item.product.id !== product.id));
        await axios.delete(`http://127.0.0.1:8000/api/wishlist/${existingItem.id}/`, config);
      } else {
        // Optimistic Add
        // We simulate the backend structure { id: temp, product: {...} }
        const fakeId = Date.now(); 
        const newItem = { id: fakeId, product: product };
        
        setWishlistItems(prev => [...prev, newItem]);
        
        await axios.post("http://127.0.0.1:8000/api/wishlist/", { product_id: product.id }, config)
             .then(() => fetchWishlist()); // Refresh to get real ID
      }
    } catch (err) {
      console.error("Error updating wishlist", err);
      // If error, revert to server state
      fetchWishlist();
    }
  };

  // FIX: Safety check with optional chaining ?.
  const isInWishlist = (id) => {
    return wishlistItems.some(item => item.product?.id === id);
  };

  return (
    <ShopContext.Provider value={{ 
        wishlistItems, 
        cartItems,
        wishlistCount: wishlistItems.length, 
        cartCount: cartItems.length,        
        fetchCart,
        fetchWishlist,
        toggleWishlist,
        isInWishlist,
        cartTotal
    }}>
      {children}
    </ShopContext.Provider>
  );
};

export const useShop = () => useContext(ShopContext);