import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const ShopContext = createContext();

export const ShopProvider = ({ children }) => {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [cartItems, setCartItems] = useState([]); 

  const token = localStorage.getItem("access_token");
  const config = { headers: { Authorization: `Bearer ${token}` } };


  const fetchWishlist = () => {
    if (!token) return;
    axios.get("http://127.0.0.1:8000/api/wishlist/", config)
      .then(res => {
        const rawData = res.data.results ? res.data.results : res.data;
        const items = Array.isArray(rawData) ? rawData.map(item => ({
             productId: item.product.id,
             wishlistId: item.id
        })) : [];
        setWishlistItems(items);
      })
      .catch(err => console.error("Error loading wishlist", err));
  };


const fetchCart = () => {
    if (!token) return;
    
    axios.get("http://127.0.0.1:8000/api/cart/", config)
      .then(res => {
        const carts = res.data.results ? res.data.results : res.data;
        if (Array.isArray(carts) && carts.length > 0) {
            const myCart = carts[0];
            setCartItems(myCart.items || []); 
        } else {
            setCartItems([]);
        }
      })
      .catch(err => console.error("Error loading cart", err));
  };


  const toggleWishlist = async (product) => {
    if (!token) { alert("Please login first."); return; }
    const existingItem = wishlistItems.find(item => item.productId === product.id);

    try {
      if (existingItem) {
        setWishlistItems(prev => prev.filter(item => item.productId !== product.id));
        await axios.delete(`http://127.0.0.1:8000/api/wishlist/${existingItem.wishlistId}/`, config);
      } else {
        const fakeId = Date.now(); 
        setWishlistItems(prev => [...prev, { productId: product.id, wishlistId: fakeId }]);
        
        await axios.post("http://127.0.0.1:8000/api/wishlist/", { product_id: product.id }, config)
             .then(() => fetchWishlist()); 
      }
    } catch (err) {
      console.error("Error updating wishlist", err);
      fetchWishlist();
    }
  };
  const isInWishlist = (productId) => {
    return wishlistItems.some(item => item.productId === productId);
  };

  const wishlistCount = wishlistItems.length;
  const cartCount = cartItems.length;

  return (
    <ShopContext.Provider value={{ 
        wishlistItems, 
        toggleWishlist, 
        wishlistCount, 
        cartCount, 
        fetchCart,
        isInWishlist 
    }}>
      {children}
    </ShopContext.Provider>
  );
};

export const useShop = () => useContext(ShopContext);