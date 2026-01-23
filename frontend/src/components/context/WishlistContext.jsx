import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  const [wishlistItems, setWishlistItems] = useState([]);

  
  const fetchWishlist = () => {
    const token = localStorage.getItem("access_token");
    if (!token) return;

  
    const config = {
      headers: { Authorization: `Bearer ${token}` }
    };

    axios.get("http://127.0.0.1:8000/api/wishlist/", config)
      .then(res => {
        const rawData = res.data.results ? res.data.results : res.data;
        if (!Array.isArray(rawData)) {
            console.error("Wishlist data is not an array:", rawData);
            return; 
        }


        const items = rawData.map(item => ({
             productId: item.product.id,
             wishlistId: item.id
        }));

        setWishlistItems(items);
      })
      .catch(err => console.error("Context: Error loading wishlist", err));
  };

  
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
        
        setWishlistItems(prev => prev.filter(item => item.productId !== product.id));
        await axios.delete(`http://127.0.0.1:8000/api/wishlist/${existingItem.wishlistId}/`, config);
        console.log("Removed from wishlist");
      } else {
        
        const res = await axios.post("http://127.0.0.1:8000/api/wishlist/", { product_id: product.id }, config);
        const newWishlistId = res.data.id;
        
        setWishlistItems(prev => [...prev, { productId: product.id, wishlistId: newWishlistId }]);
        console.log("Added to wishlist");
      }
    } catch (err) {
      console.error("Error updating wishlist", err);
      
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