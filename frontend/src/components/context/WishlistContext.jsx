import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  const [wishlistItems, setWishlistItems] = useState([]);

  // ✅ Defined as a reusable function so we can call it after adding/removing items if needed
  const fetchWishlist = () => {
    const token = localStorage.getItem("access_token");
    if (!token) return;

    // 1. Define Config Here
    const config = {
      headers: { Authorization: `Bearer ${token}` }
    };

    axios.get("http://127.0.0.1:8000/api/wishlist/", config)
      .then(res => {
        // 2. Safely Extract the Array
        // If paginated: data is in 'res.data.results'
        // If NOT paginated: data is in 'res.data'
        const rawData = res.data.results ? res.data.results : res.data;

        // 3. Safety Check: Ensure rawData is an Array before mapping
        if (!Array.isArray(rawData)) {
            console.error("Wishlist data is not an array:", rawData);
            return; 
        }

        // 4. Map to your format
        const items = rawData.map(item => ({
             productId: item.product.id,
             wishlistId: item.id
        }));

        setWishlistItems(items);
      })
      .catch(err => console.error("Context: Error loading wishlist", err));
  };

  // Run fetch on mount
  useEffect(() => {
    fetchWishlist();
  }, []);

  const isInWishlist = (productId) => {
    return wishlistItems.some(item => item.productId === productId);
  };

  const toggleWishlist = async (product) => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      alert("Please login first.");
      return;
    }

    const config = { headers: { Authorization: `Bearer ${token}` } };
    const existingItem = wishlistItems.find(item => item.productId === product.id);

    try {
      if (existingItem) {
        // Optimistic Remove
        setWishlistItems(prev => prev.filter(item => item.productId !== product.id));
        await axios.delete(`http://127.0.0.1:8000/api/wishlist/${existingItem.wishlistId}/`, config);
        console.log("Removed from wishlist");
      } else {
        // Add Item
        const res = await axios.post("http://127.0.0.1:8000/api/wishlist/", { product_id: product.id }, config);
        const newWishlistId = res.data.id;
        
        // Optimistic Add
        setWishlistItems(prev => [...prev, { productId: product.id, wishlistId: newWishlistId }]);
        console.log("Added to wishlist");
      }
    } catch (err) {
      console.error("Error updating wishlist", err);
      // Optional: Re-fetch if the optimistic update failed
      fetchWishlist(); 
    }
  };

  return (
    <WishlistContext.Provider value={{ wishlistItems, toggleWishlist, isInWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => useContext(WishlistContext);