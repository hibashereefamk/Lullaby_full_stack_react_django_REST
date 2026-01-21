import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  // Store objects: [{ productId: 1, wishlistId: 101 }, ...]
  const [wishlistItems, setWishlistItems] = useState([]);

  // 1. Fetch Wishlist on Load
  useEffect(() => {
    const fetchWishlist = async () => {
      const token = localStorage.getItem("access_token");
      if (!token) return;

      try {
        const res = await axios.get("http://127.0.0.1:8000/api/wishlist/", {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // Map response to our helper format
        const items = res.data.map(item => ({
          productId: item.product.id, // The ID of the shirt/shoe
          wishlistId: item.id         // The ID of the wishlist row (Required for DELETE)
        }));
        
        setWishlistItems(items);
      } catch (err) {
        console.error("Context: Error loading wishlist", err);
      }
    };
    fetchWishlist();
  }, []);

  // 2. Helper to check if item is liked
  const isInWishlist = (productId) => {
    return wishlistItems.some(item => item.productId === productId);
  };

  // 3. The Toggle Function
  const toggleWishlist = async (product) => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      alert("Please login first.");
      return;
    }

    const config = { headers: { Authorization: `Bearer ${token}` } };
    
    // Find if we already have this product in the list
    const existingItem = wishlistItems.find(item => item.productId === product.id);

    try {
      if (existingItem) {
        // --- REMOVE LOGIC ---
        // 1. Optimistic Update (Remove from screen immediately)
        setWishlistItems(prev => prev.filter(item => item.productId !== product.id));

        // 2. API Call: Use 'wishlistId' (existingItem.wishlistId)
        await axios.delete(`http://127.0.0.1:8000/api/wishlist/${existingItem.wishlistId}/`, config);
        console.log("Removed from wishlist");

      } else {
        // --- ADD LOGIC ---
        // 1. API Call FIRST (We need the new ID from the server)
        const res = await axios.post(
          "http://127.0.0.1:8000/api/wishlist/", 
          { product_id: product.id }, 
          config
        );
        
        // 2. Update State with the new ID from backend
        const newWishlistId = res.data.id; 
        setWishlistItems(prev => [...prev, { productId: product.id, wishlistId: newWishlistId }]);
        console.log("Added to wishlist");
      }
    } catch (err) {
      console.error("Error updating wishlist", err);
      // Revert if API fails (Reload list from server to be safe)
      // fetchWishlist(); // You could call the fetch function again here
    }
  };

  return (
    <WishlistContext.Provider value={{ wishlistItems, toggleWishlist, isInWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => useContext(WishlistContext);