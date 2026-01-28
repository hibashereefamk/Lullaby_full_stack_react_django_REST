import { createContext, useContext, useState, useEffect, useCallback } from "react";
import axios from "axios";

const ShopContext = createContext();

export const ShopProvider = ({ children }) => {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [cartItems, setCartItems] = useState([]);

  const token = localStorage.getItem("access_token");
  const config = { headers: { Authorization: `Bearer ${token}` } };

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
        } else {
           setCartItems([]);
          
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


  useEffect(() => {
    if (token) {
      fetchCart();
      fetchWishlist();
    } else {
      setCartItems([]);
      setWishlistItems([]);
      
    }
  }, [token, fetchCart, fetchWishlist]); 

  const toggleWishlist = async (product) => {
    if (!token) { alert("Please login first."); return; }
    
    const existingItem = wishlistItems.find(item => item.product.id === product.id);

    try {
      if (existingItem) {
        setWishlistItems(prev => prev.filter(item => item.product.id !== product.id));
        await axios.delete(`http://127.0.0.1:8000/api/wishlist/${existingItem.id}/`, config);
      } else {
        const fakeId = Date.now(); 
        const newItem = { id: fakeId, product: product };
        
        setWishlistItems(prev => [...prev, newItem]);
        
        await axios.post("http://127.0.0.1:8000/api/wishlist/", { product_id: product.id }, config)
             .then(() => fetchWishlist()); 
      }
    } catch (err) {
      console.error("Error updating wishlist", err);
     
      fetchWishlist();
    }
  };
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
    }}>
      {children}
    </ShopContext.Provider>
  );
};

export const useShop = () => useContext(ShopContext);